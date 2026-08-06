from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List


class CafeteriaKnowledgeEngine:
    """A lightweight engine that mirrors the Prolog knowledge base contract for the app."""

    def __init__(self, kb_path: str | None = None) -> None:
        base_dir = Path(__file__).resolve().parents[2]
        self.kb_path = Path(kb_path or base_dir / "knowledge_base" / "meals.pl")
        self._meals = self._load_meals()

    def _load_meals(self) -> List[Dict[str, Any]]:
        meals_path = self.kb_path
        if not meals_path.exists():
            raise FileNotFoundError(f"Meal knowledge base not found: {meals_path}")

        text = meals_path.read_text(encoding="utf-8")
        meals: List[Dict[str, Any]] = []
        lines = [line.rstrip() for line in text.splitlines()]
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line.startswith("meal("):
                i += 1
                continue
            if line.startswith("%%"):
                i += 1
                continue
            fact_lines = []
            while i < len(lines):
                current = lines[i].strip()
                if current.endswith("."):
                    fact_lines.append(current)
                    break
                fact_lines.append(current)
                i += 1
            if i < len(lines):
                i += 1
            full_fact = " ".join(fact_lines)
            match = re.match(r"meal\((m\d+),\s*'([^']+)',\s*(veg|non_veg),\s*(high_protein|low_carb|low_fat|balanced),\s*(yes|moderate|no),\s*(breakfast|lunch|dinner|snack)\)", full_fact)
            if match:
                meal_id, name, category, nutrition_goal, gym_suitable, meal_type = match.groups()
                meals.append(
                    {
                        "id": meal_id,
                        "name": name,
                        "category": category,
                        "nutrition_goal": nutrition_goal,
                        "gym_suitable": gym_suitable,
                        "meal_type": meal_type,
                    }
                )
            continue
        return meals

    def _matches(self, meal: Dict[str, Any], preferences: Dict[str, Any]) -> bool:
        category = preferences.get("category", "none")
        goal = preferences.get("goal", "balanced")
        health = preferences.get("health", "none")
        meal_type = preferences.get("meal_type", "lunch")
        convenience = preferences.get("convenience", "none")
        allergy = preferences.get("allergy", "none")

        if category == "veg" and meal["category"] != "veg":
            return False
        if category == "non_veg" and meal["category"] != "non_veg":
            return False
        if category == "gym" and meal["gym_suitable"] not in {"yes", "moderate"}:
            return False

        if goal == "high_protein" and meal["nutrition_goal"] != "high_protein":
            return False
        if goal == "low_carb" and meal["nutrition_goal"] != "low_carb":
            return False
        if goal == "low_fat" and meal["nutrition_goal"] != "low_fat":
            return False

        if health == "wl" and goal != "low_carb" and goal != "low_fat":
            return False
        if health == "wg" and goal != "high_protein":
            return False

        if convenience == "quick" and meal["meal_type"] != "snack":
            return False
        if meal_type and meal["meal_type"] != meal_type:
            return False

        if allergy != "none":
            allergic_meals = {
                "nuts": {"m1", "m5", "m11", "m14"},
                "dairy": {"m11"},
                "gluten": {"m11", "m16", "m18"},
                "seafood": {"m6", "m15"},
            }
            if meal["id"] in allergic_meals.get(allergy, set()):
                return False

        return True

    def recommend(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        matched = [meal for meal in self._meals if self._matches(meal, preferences)]
        if not matched:
            matched = list(self._meals)
        meals = [
            {
                "id": meal["id"],
                "name": meal["name"],
                "reason": self._reason_for(meal, preferences),
                "explanation": self._explanation_for(meal, preferences),
            }
            for meal in matched[:8]
        ]
        return {"meals": meals, "weekly_plan": self._build_weekly_plan(matched[:8])}

    def weekly_plan(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        matched = [meal for meal in self._meals if self._matches(meal, preferences)]
        if not matched:
            matched = list(self._meals)
        plan = {}
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for index, day in enumerate(days):
            meal = matched[index % len(matched)] if matched else None
            plan[day] = meal["name"] if meal else ""
        return {"weekly_plan": plan}

    def explanations(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        matched = [meal for meal in self._meals if self._matches(meal, preferences)]
        if not matched:
            matched = list(self._meals)
        explanations = [self._explanation_for(meal, preferences) for meal in matched[:6]]
        return {"explanations": explanations}

    def _reason_for(self, meal: Dict[str, Any], preferences: Dict[str, Any]) -> str:
        goal = preferences.get("goal", "balanced")
        category = preferences.get("category", "none")
        if goal in {"high_protein", "low_carb", "low_fat"}:
            return f"Matches your {goal} preference"
        if category == "veg":
            return "Vegetarian-friendly option"
        return "Balanced cafeteria recommendation"

    def _explanation_for(self, meal: Dict[str, Any], preferences: Dict[str, Any]) -> str:
        return (
            f"Meal: {meal['name']} | Category: {meal['category']} | "
            f"Nutrition: {meal['nutrition_goal']} | Gym: {meal['gym_suitable']} | "
            f"Type: {meal['meal_type']} | Preferences: {json.dumps(preferences, sort_keys=True)}"
        )

    def _build_weekly_plan(self, meals: List[Dict[str, Any]]) -> Dict[str, Any]:
        plan = {}
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for index, day in enumerate(days):
            meal = meals[index % len(meals)] if meals else None
            plan[day] = meal["name"] if meal else ""
        return plan
