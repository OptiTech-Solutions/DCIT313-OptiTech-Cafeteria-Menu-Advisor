from pyswip import Prolog
from pathlib import Path
import threading
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KB = Path(__file__).parent.parent.parent / 'knowledge_base/cafeteria_kb.pl'
_lock = threading.Lock()
_pl = None  # Lazy init

VALID_KEYS = {'category', 'goal', 'health', 'meal_type', 'convenience', 'allergy'}


def _validate_prefs(prefs: dict) -> None:
    invalid = set(prefs) - VALID_KEYS
    if invalid:
        raise ValueError(f"Invalid prefs keys: {invalid}")


def _assert_prefs(prefs: dict) -> None:
    for key, val in prefs.items():
        fact = f"user_preference('{key}', '{val}')"
        _pl.assertz(fact)
        logger.debug(f"Asserted: {fact}")


def _parse_plan_list(plan_list) -> dict:
    plan = {}
    for i, pair in enumerate(plan_list):
        try:
            if hasattr(pair, 'args') and len(pair.args) == 2:
                day = str(pair.args[0])
                meal = str(pair.args[1])
                plan[day] = meal
            elif isinstance(pair, str):
                cleaned = pair.strip()
                if cleaned.startswith('-(') and cleaned.endswith(')'):
                    cleaned = cleaned[2:-1]
                if ',' in cleaned:
                    day_part, meal_part = cleaned.split(',', 1)
                    plan[day_part.strip()] = meal_part.strip()
                else:
                    logger.warning(f"Unexpected plan pair at {i}: {pair}")
            else:
                logger.warning(f"Unexpected plan pair at {i}: {pair}")
        except Exception as e:
            logger.warning(f"Plan parse error at {i}: {e}")
    return plan


def _init_prolog():
    global _pl
    if _pl is None:
        with _lock:
            if _pl is None:
                try:
                    _pl = Prolog()
                    if not KB.exists():
                        raise FileNotFoundError(f"KB missing: {KB}")
                    _pl.consult(str(KB))
                    logger.info(f"Prolog KB loaded: {KB}")
                except Exception as e:
                    logger.error(f"Prolog init failed: {e}")
                    raise


def query_recommendations(prefs: dict) -> dict:
    _validate_prefs(prefs)

    _init_prolog()

    with _lock:
        try:
            _assert_prefs(prefs)

            safe_results = list(_pl.query('safe_recommend(ID, Name, Reason)'))
            if not safe_results:
                fallback_results = list(_pl.query('recommend(ID, Name, Reason)'))
            else:
                fallback_results = []

            results = safe_results or fallback_results

            if not results:
                logger.warning("No recommendations found")
                return {'meals': [], 'weekly_plan': {}}

            meals = []
            seen_ids = set()
            user_meal_type = prefs.get('meal_type')
            for r in results:
                try:
                    meal_id = str(r['ID'])
                    if meal_id in seen_ids:
                        continue
                    meal_query = _pl.query(f"meal({meal_id}, _, _, _, _, MealType)")
                    meal_types = [str(mt['MealType']) for mt in meal_query]
                    if not meal_types:
                        logger.warning(f"No meal fact for ID: {meal_id}")
                        continue
                    actual_type = meal_types[0]
                    if user_meal_type and actual_type != user_meal_type:
                        logger.debug(
                            f"Filtered {meal_id} ({actual_type}): user wants {user_meal_type}"
                        )
                        continue
                    explanation = None
                    try:
                        exp_query = list(
                            _pl.query(f"explain_recommendation({meal_id}, Explanation)")
                        )
                        if exp_query:
                            explanation = str(exp_query[0].get('Explanation'))
                    except Exception as e:
                        logger.warning(f"Explanation query failed for {meal_id}: {e}")

                    meals.append(
                        {
                            'id': meal_id,
                            'name': str(r['Name']),
                            'reason': str(r['Reason']),
                            'explanation': explanation,
                        }
                    )
                    seen_ids.add(meal_id)
                except (KeyError, Exception) as e:
                    logger.warning(f"Meal filter error for {r.get('ID', 'unknown')}: {e}")

            plan = {}
            plan_raw = list(_pl.query('weekly_plan(Plan)'))
            if plan_raw:
                try:
                    plan_list = plan_raw[0].get('Plan', [])
                    plan = _parse_plan_list(plan_list)
                except (IndexError, AttributeError) as e:
                    logger.warning(f"Plan parse error: {e}")

            logger.info(f"Returning {len(meals)} meals (filtered), plan: {len(plan)} days")
            return {'meals': meals, 'weekly_plan': plan}
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return {'meals': [], 'weekly_plan': {}, 'error': str(e)}
        finally:
            _pl.retractall('user_preference(_, _)')


def query_weekly_plan(prefs: dict) -> dict:
    _validate_prefs(prefs)
    _init_prolog()

    with _lock:
        try:
            _assert_prefs(prefs)
            plan = {}
            plan_raw = list(_pl.query('weekly_plan(Plan)'))
            if plan_raw:
                plan_list = plan_raw[0].get('Plan', [])
                plan = _parse_plan_list(plan_list)
            return {'weekly_plan': plan}
        except Exception as e:
            logger.error(f"Weekly plan query failed: {e}")
            return {'weekly_plan': {}, 'error': str(e)}
        finally:
            _pl.retractall('user_preference(_, _)')


def query_explanations(prefs: dict, meal_type=None) -> dict:
    _validate_prefs(prefs)
    _init_prolog()

    with _lock:
        try:
            _assert_prefs(prefs)
            explanations = []
            recs = list(_pl.query('safe_recommend(ID, Name, Reason)'))
            for rec in recs:
                meal_id = str(rec.get('ID'))
                if meal_type:
                    try:
                        meal_type_query = list(
                            _pl.query(f"meal({meal_id}, _, _, _, _, MealType)")
                        )
                        if not meal_type_query:
                            continue
                        actual_type = str(meal_type_query[0].get('MealType'))
                        if actual_type != meal_type:
                            continue
                    except Exception as e:
                        logger.warning(f"Meal type filter failed for {meal_id}: {e}")
                        continue
                try:
                    exp_query = list(_pl.query(f"explain_recommendation({meal_id}, Explanation)"))
                    if exp_query:
                        explanations.append(str(exp_query[0].get('Explanation')))
                    else:
                        explanations.append(
                            f"Meal: {rec.get('Name')} | Reason: {rec.get('Reason')}"
                        )
                except Exception as e:
                    logger.warning(f"Explanation query failed for {meal_id}: {e}")
                    explanations.append(
                        f"Meal: {rec.get('Name')} | Reason: {rec.get('Reason')}"
                    )
            return {'explanations': explanations}
        except Exception as e:
            logger.error(f"Explanation query failed: {e}")
            return {'explanations': [], 'error': str(e)}
        finally:
            _pl.retractall('user_preference(_, _)')
