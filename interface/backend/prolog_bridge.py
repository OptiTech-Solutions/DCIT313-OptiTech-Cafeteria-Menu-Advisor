from pyswip import Prolog
from pathlib import Path
import threading

KB = Path(__file__).parent.parent / 'knowledge_base' / 'cafeteria_kb.pl'
_lock = threading.Lock() 
_pl = Prolog()
_pl.consult(str(KB))


def query_recommendations(prefs: dict) -> dict:
    """
    prefs keys: category, goal, health, meal_type, convenience
    Returns: {meals: [...], weekly_plan: {...}}
    """
    with _lock:
        try:
            # 1. Assert user preferences as Prolog dynamic facts
            for key, val in prefs.items():
                _pl.assertz(f'user_preference({key}, {val})')
            
            # 2. Query safe recommendations (forward chaining fires here)
            results = list(_pl.query('safe_recommend(ID, Name, Reason)'))
            
            # 3. Fallback: balanced diet if nothing matched
            if not results:
                results = list(_pl.query(
                    'recommend(ID, Name, \'General: balanced diet meal\')'))
            
            # Handle case where even fallback returns nothing
            if not results:
                return {'meals': [], 'weekly_plan': {}}
            
            # 4. Weekly plan
            plan_raw = list(_pl.query('weekly_plan(Plan)'))
            plan = {}
            if plan_raw:
                for pair in plan_raw[0]['Plan']:
                    plan[str(pair.args[0])] = str(pair.args[1])
            
            meals = [{'id': str(r['ID']), 'name': str(r['Name']),
                      'reason': str(r['Reason'])} for r in results]
            return {'meals': meals, 'weekly_plan': plan}
        finally:
            # ALWAYS retract — prevents preference bleed between users
            _pl.retractall('user_preference(_, _)')
