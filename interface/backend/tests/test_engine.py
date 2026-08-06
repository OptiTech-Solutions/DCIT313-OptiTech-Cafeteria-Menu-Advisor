import unittest
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from knowledge_engine import CafeteriaKnowledgeEngine


class CafeteriaKnowledgeEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = CafeteriaKnowledgeEngine()

    def test_gym_high_protein_recommendations(self):
        result = self.engine.recommend({
            "category": "gym",
            "goal": "high_protein",
            "health": "none",
            "meal_type": "lunch",
            "convenience": "none",
            "allergy": "none"
        })
        self.assertTrue(result["meals"])
        self.assertTrue(any(meal["id"] in {"m2", "m12", "m17"} for meal in result["meals"]))

    def test_vegetarian_safety_guard(self):
        result = self.engine.recommend({
            "category": "veg",
            "goal": "high_protein",
            "health": "none",
            "meal_type": "lunch",
            "convenience": "none",
            "allergy": "none"
        })
        self.assertTrue(result["meals"])
        self.assertTrue(all(meal["name"].lower().find("chicken") == -1 for meal in result["meals"]))

    def test_weekly_plan_has_seven_days(self):
        result = self.engine.weekly_plan({
            "category": "none",
            "goal": "balanced",
            "health": "none",
            "meal_type": "lunch",
            "convenience": "none",
            "allergy": "none"
        })
        self.assertEqual(len(result["weekly_plan"]), 7)

    def test_explanations_are_generated(self):
        result = self.engine.explanations({
            "category": "veg",
            "goal": "balanced",
            "health": "none",
            "meal_type": "lunch",
            "convenience": "none",
            "allergy": "none"
        })
        self.assertTrue(result["explanations"])


if __name__ == "__main__":
    unittest.main()
