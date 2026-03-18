from pyswip import Prolog
from pathlib import Path
import threading
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KB = Path(__file__).parent.parent.parent / 'knowledge_base/cafeteria_kb.pl'
_lock = threading.Lock() 
_pl = None  # Lazy init

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


def qquery_recommendations(prefs: dict) -> dict:
    valid_keys = {'category', 'goal', 'health', 'meal_type', 'convenience'}
    if not all(k in valid_keys for k in prefs):
        raise ValueError(f"Invalid prefs keys: {set(prefs) - valid_keys}")
    
    _init_prolog()
    
    with _lock:
        try:
            # 1. Assert quoted atoms
            for key, val in prefs.items():
                fact = f"user_preference('{key}', '{val}')"
                _pl.assertz(fact)
                logger.debug(f"Asserted: {fact}")
            
            # 2. Safe recommendations
            safe_results = list(_pl.query('safe_recommend(ID, Name, Reason)'))
            
            # 3. Fallback: match KB pattern
            if not safe_results:
                fallback_results = list(_pl.query('recommend(ID, Name, Reason)'))
            else:
                fallback_results = []
            
            results = safe_results or fallback_results
            
            if not results:
                logger.warning("No recommendations found")
                return {'meals': [], 'weekly_plan': {}}
            
            # 4. Parse and filter meals by meal_type if specified
            meals = []
            user_meal_type = prefs.get('meal_type')
            for r in results:
                try:
                    meal_id = str(r['ID'])
                    # Query meal_type for this ID
                    meal_query = _pl.query(f"meal({meal_id}, _, _, _, _, MealType)")
                    meal_types = [str(mt['MealType']) for mt in meal_query]
                    if not meal_types:
                        logger.warning(f"No meal fact for ID: {meal_id}")
                        continue
                    # Take first meal_type (meals.pl has unique IDs)
                    actual_type = meal_types[0]
                    if user_meal_type and actual_type != user_meal_type:
                        logger.debug(f"Filtered {meal_id} ({actual_type}): user wants {user_meal_type}")
                        continue
                    meals.append({
                        'id': meal_id,
                        'name': str(r['Name']),
                        'reason': str(r['Reason'])
                    })
                except (KeyError, Exception) as e:
                    logger.warning(f"Meal filter error for {r.get('ID', 'unknown')}: {e}")

            
            # 5. Weekly plan (robust)
            plan = {}
            plan_raw = list(_pl.query('weekly_plan(Plan)'))
            if plan_raw:
                try:
                    plan_list = plan_raw[0].get('Plan', [])
                    for i, pair in enumerate(plan_list):
                        if hasattr(pair, 'args') and len(pair.args) == 2:
                            day = str(pair.args[0])
                            meal = str(pair.args[1])
                            plan[day] = meal
                        else:
                            logger.warning(f"Unexpected plan pair at {i}: {pair}")
                except (IndexError, AttributeError) as e:
                    logger.warning(f"Plan parse error: {e}")
            
            logger.info(f"Returning {len(meals)} meals (filtered), plan: {len(plan)} days")
            return {'meals': meals, 'weekly_plan': plan}
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return {'meals': [], 'weekly_plan': {}, 'error': str(e)}
        finally:
            _pl.retractall('user_preference(_, _)')
