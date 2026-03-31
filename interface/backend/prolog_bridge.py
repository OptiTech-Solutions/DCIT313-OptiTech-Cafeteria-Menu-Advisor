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


def _assert_preferences(prefs: dict):
    """Sets the user preferences in the Prolog KB."""
    for key, val in prefs.items():
        fact = f"user_preference('{key}', '{val}')"
        _pl.assertz(fact)
        logger.debug(f"Asserted: {fact}")

def _fetch_recommendations():
    """Queries Prolog for recommendations with a fallback logic."""
    safe_results = list(_pl.query('unique_recommend(ID, Name, Reason)'))
    if not safe_results:
        return list(_pl.query('recommend(ID, Name, Reason)'))
    return safe_results

def _aggregate_meal_reasons(results: list) -> list:
    """Consolidates reasons for meals with the same ID."""
    meals_dict = {}
    for r in results:
        try:
            meal_id = str(r['ID'])
            meal_name = str(r['Name'])
            meal_reason = str(r['Reason'])

            if meal_id not in meals_dict:
                meals_dict[meal_id] = {
                    'id': meal_id,
                    'name': meal_name,
                    'reasons': [meal_reason]
                }
            else:
                if meal_reason not in meals_dict[meal_id]['reasons']:
                    meals_dict[meal_id]['reasons'].append(meal_reason)
        except (KeyError, Exception) as e:
            logger.warning(f"Error parsing result row: {e}")

    # Format output by joining reasons and cleaning up list objects
    final_meals = []
    for meal in meals_dict.values():
        meal['reason'] = " & ".join(meal['reasons'])
        del meal['reasons']
        final_meals.append(meal)
    return final_meals

def query_recommendations(prefs: dict) -> dict:
    valid_keys = {'category', 'goal', 'health', 'meal_type', 'convenience'}
    if not all(k in valid_keys for k in prefs):
        raise ValueError(f"Invalid prefs keys: {set(prefs) - valid_keys}")
    
    _init_prolog()
    
    with _lock:
        try:
            # 1. Assert preferences
            _assert_preferences(prefs)
            
            # 2. Query and handle empty results
            results = _fetch_recommendations()
            if not results:
                logger.warning("No recommendations found")
                return {'meals': [], 'weekly_plan': {}}
            
            # 3. Aggregate and format
            final_meals = _aggregate_meal_reasons(results)
            
            # Note: You can add your weekly_plan parsing here as well
            return {'meals': final_meals}

        except Exception as e:
            logger.error(f"Query failed: {e}")
            return {'meals': [], 'weekly_plan': {}, 'error': str(e)}
        finally:
            _pl.retractall('user_preference(_, _)')