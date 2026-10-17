import unittest
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from prolog_bridge import PrologBridge


class TestPrologBridge(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bridge = PrologBridge()

    def test_kb_loaded(self):
        self.assertIsNotNone(self.bridge._meals_cache)
        self.assertGreater(len(self.bridge._meals_cache), 10)

    def test_gym_high_protein(self):
        res = self.bridge.recommend({"category": "gym", "goal": "high_protein"})
        self.assertGreater(len(res["meals"]), 0)
        # Should have high protein meals
        for meal in res["meals"]:
            self.assertIn("protein", meal["reason"].lower())

    def test_vegetarian_safety_guard_no_meat(self):
        res = self.bridge.recommend({"category": "veg", "goal": "high_protein"})
        self.assertGreater(len(res["meals"]), 0)
        for meal in res["meals"]:
            # None of the meals recommended should be non_veg
            self.assertEqual(meal["category"], "veg", f"Violated safety guard: {meal['name']} is not veg!")

    def test_allergen_filter(self):
        # Nut allergy
        res = self.bridge.recommend({"category": "veg", "allergy": "nuts"})
        meal_ids = [m["id"] for m in res["meals"]]
        # m1, m5, m14 have nuts
        self.assertNotIn("m1", meal_ids)
        self.assertNotIn("m5", meal_ids)
        self.assertNotIn("m14", meal_ids)

    def test_weekly_plan_seven_days(self):
        res = self.bridge.weekly_plan({"category": "veg", "goal": "balanced"})
        plan = res["weekly_plan"]
        self.assertEqual(len(plan), 7)
        expected_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for d in expected_days:
            self.assertIn(d, plan)
            self.assertTrue(len(plan[d]) > 0)

    def test_explanation_generation(self):
        res = self.bridge.explanations({"category": "veg", "goal": "high_protein"})
        self.assertIn("explanations", res)
        self.assertGreater(len(res["explanations"]), 0)
        self.assertIn("why_not", res)


if __name__ == "__main__":
    unittest.main()
