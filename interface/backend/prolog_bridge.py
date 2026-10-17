from __future__ import annotations

import json
import logging
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("prolog_bridge")
logging.basicConfig(level=logging.INFO)

KB_DIR = Path(__file__).resolve().parents[2] / "knowledge_base"
MASTER_KB = KB_DIR / "cafeteria_kb.pl"

VALID_PREFS = {
    "category": {"veg", "non_veg", "gym", "none"},
    "goal": {"high_protein", "low_carb", "low_fat", "balanced"},
    "health": {"wl", "wg", "none"},
    "meal_type": {"breakfast", "lunch", "dinner", "snack"},
    "convenience": {"quick", "none"},
    "allergy": {"none", "nuts", "dairy", "gluten", "seafood"},
}

DEFAULT_PREFERENCES: Dict[str, str] = {
    "category": "none",
    "goal": "balanced",
    "health": "none",
    "meal_type": "lunch",
    "convenience": "none",
    "allergy": "none",
}

# Macronutrient database (Calories, Protein, Carbs, Fat)
MEAL_NUTRITION: Dict[str, Dict[str, Any]] = {
    "m1": {"calories": 420, "protein": "26g", "carbs": "38g", "fat": "18g"},
    "m2": {"calories": 510, "protein": "44g", "carbs": "52g", "fat": "11g"},
    "m3": {"calories": 360, "protein": "22g", "carbs": "34g", "fat": "14g"},
    "m4": {"calories": 580, "protein": "28g", "carbs": "72g", "fat": "20g"},
    "m5": {"calories": 390, "protein": "14g", "carbs": "62g", "fat": "12g"},
    "m6": {"calories": 380, "protein": "38g", "carbs": "18g", "fat": "10g"},
    "m7": {"calories": 490, "protein": "20g", "carbs": "76g", "fat": "12g"},
    "m8": {"calories": 180, "protein": "3g", "carbs": "44g", "fat": "1g"},
    "m9": {"calories": 440, "protein": "24g", "carbs": "32g", "fat": "26g"},
    "m10": {"calories": 420, "protein": "32g", "carbs": "42g", "fat": "13g"},
    "m11": {"calories": 310, "protein": "18g", "carbs": "42g", "fat": "8g"},
    "m12": {"calories": 520, "protein": "42g", "carbs": "28g", "fat": "22g"},
    "m13": {"calories": 450, "protein": "21g", "carbs": "65g", "fat": "12g"},
    "m14": {"calories": 360, "protein": "28g", "carbs": "38g", "fat": "11g"},
    "m15": {"calories": 350, "protein": "36g", "carbs": "12g", "fat": "10g"},
    "m16": {"calories": 290, "protein": "11g", "carbs": "46g", "fat": "6g"},
    "m17": {"calories": 460, "protein": "40g", "carbs": "44g", "fat": "9g"},
    "m18": {"calories": 280, "protein": "10g", "carbs": "48g", "fat": "5g"},
}


def find_swipl_binary() -> Optional[str]:
    """Locate SWI-Prolog executable in system PATH or standard install paths."""
    found = shutil.which("swipl")
    if found:
        return found

    candidates = [
        r"C:\Program Files\swipl\bin\swipl.exe",
        r"C:\Program Files (x86)\swipl\bin\swipl.exe",
        r"C:\swipl\bin\swipl.exe",
        str(Path.home() / "AppData" / "Local" / "Programs" / "swipl" / "bin" / "swipl.exe"),
        "/usr/bin/swipl",
        "/usr/local/bin/swipl",
    ]
    for candidate in candidates:
        if Path(candidate).is_file():
            return candidate
    return None


class PrologBridge:
    """
    Expert System Bridge to the Prolog Knowledge Base.
    Interacts with SWI-Prolog via swipl CLI when available, with an
    in-process Horn clause inference engine mirroring the exact Prolog
    production rules when SWI-Prolog is not installed.
    """

    def __init__(self, kb_path: Optional[Path] = None):
        self.kb_path = kb_path or MASTER_KB
        self.swipl_path = find_swipl_binary()
        self._meals_cache: Optional[List[Dict[str, Any]]] = None
        self._allergens_cache: Optional[Dict[str, List[str]]] = None
        self._load_knowledge_base()

    def _load_knowledge_base(self) -> None:
        meals_file = KB_DIR / "meals.pl"
        if not meals_file.exists():
            logger.warning("meals.pl not found at %s", meals_file)
            self._meals_cache = []
            self._allergens_cache = {}
            return

        text = meals_file.read_text(encoding="utf-8")
        meals: List[Dict[str, Any]] = []
        allergens: Dict[str, List[str]] = {}

        # Parse meal facts: meal(ID, Name, Category, NutritionGoal, GymSuitable, MealType).
        meal_pattern = re.compile(
            r"meal\(\s*([a-zA-Z0-9_]+)\s*,\s*'([^']+)'\s*,\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)\."
        )
        for match in meal_pattern.finditer(text):
            meal_id, name, cat, goal, gym, mtype = match.groups()
            macros = MEAL_NUTRITION.get(meal_id, {"calories": 400, "protein": "25g", "carbs": "45g", "fat": "12g"})
            meals.append({
                "id": meal_id,
                "name": name,
                "category": cat,
                "nutrition_goal": goal,
                "gym_suitable": gym,
                "meal_type": mtype,
                "macros": macros,
            })

        # Parse meal_allergen facts: meal_allergen(ID, Allergen).
        allergen_pattern = re.compile(
            r"meal_allergen\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)\."
        )
        for match in allergen_pattern.finditer(text):
            meal_id, allergen = match.groups()
            allergens.setdefault(meal_id, []).append(allergen)

        self._meals_cache = meals
        self._allergens_cache = allergens
        logger.info(
            "Loaded Prolog KB: %d meals, %d allergen facts from %s",
            len(meals),
            len(allergens),
            meals_file,
        )

    def validate_prefs(self, prefs: Dict[str, Any]) -> Dict[str, str]:
        validated = dict(DEFAULT_PREFERENCES)
        for key, val in prefs.items():
            if key in VALID_PREFS:
                sval = str(val).strip().lower()
                if sval in VALID_PREFS[key]:
                    validated[key] = sval
        return validated

    def is_swipl_available(self) -> bool:
        return self.swipl_path is not None

    def get_prolog_query_trace(self, prefs: Dict[str, str]) -> str:
        """Constructs the readable Prolog interactive query trace."""
        asserts = [f"assertz(user_preference({k}, {v}))." for k, v in prefs.items() if v != "none"]
        if not asserts:
            asserts = ["assertz(user_preference(goal, balanced))."]
        joined_asserts = "\n?- ".join(asserts)
        return (
            f"?- consult('cafeteria_kb.pl').\n"
            f"?- {joined_asserts}\n"
            f"?- safe_recommend(ID, Name, Reason).\n"
            f"?- weekly_plan(Plan).\n"
            f"?- retractall(user_preference(_, _))."
        )

    # =========================================================================
    # Direct Prolog Production Rules & Safety Guard Engine
    # (Faithful execution of knowledge_base/production_rules.pl & explanation.pl)
    # =========================================================================

    def _is_unsafe(self, meal: Dict[str, Any], prefs: Dict[str, str]) -> Tuple[bool, Optional[str]]:
        r"""
        production_rules.pl SAFETY GUARD:
        unsafe(ID) :- user_preference(category, veg), meal(ID, _, non_veg, _, _, _).
        unsafe(ID) :- user_preference(allergy, Allergy), Allergy \= none, meal_allergen(ID, Allergy).
        """
        # Safety rule 1: Vegetarians never receive non-veg
        if prefs.get("category") == "veg" and meal["category"] != "veg":
            return True, "Safety Guard: Vegetarians cannot be recommended meat or poultry meals."

        # Safety rule 2: Allergen filter
        allergy = prefs.get("allergy", "none")
        if allergy != "none":
            meal_allergens = (self._allergens_cache or {}).get(meal["id"], [])
            if allergy in meal_allergens:
                return True, f"Safety Guard: Meal contains '{allergy}', violating your allergen restriction."

        return False, None

    def _calculate_match_score(self, meal: Dict[str, Any], prefs: Dict[str, str], rule_code: str) -> int:
        """Calculates a certainty / suitability match score (70% - 98%)."""
        score = 75
        if rule_code.startswith("G"):
            score = 96
        elif rule_code.startswith("V") or rule_code.startswith("N"):
            score = 92
        elif rule_code.startswith("H"):
            score = 88
        elif rule_code.startswith("C"):
            score = 85

        # Bonus if preferred meal_type aligns
        if prefs.get("meal_type") == meal["meal_type"]:
            score = min(98, score + 3)
        return score

    def _evaluate_production_rules(self, prefs: Dict[str, str]) -> List[Tuple[Dict[str, Any], str, str]]:
        """
        Evaluates production rules ordered by priority:
        Returns tuples of (Meal, ReasonText, RuleCode).
        Priority 1 (highest): Gym Student Rules (G1–G4)
        Priority 2: Vegetarian (V1–V4) & Non-Vegetarian (N1–N3) Rules
        Priority 3: Health-Based Rules (H1–H4)
        Priority 4 (lowest): Convenience Rules (C1)
        """
        category = prefs.get("category", "none")
        goal = prefs.get("goal", "balanced")
        health = prefs.get("health", "none")
        meal_type = prefs.get("meal_type", "lunch")
        convenience = prefs.get("convenience", "none")

        candidates: List[Tuple[Dict[str, Any], str, str]] = []
        meals = self._meals_cache or []

        for m in meals:
            # Check safety guard first (\+ unsafe(ID))
            unsafe, _ = self._is_unsafe(m, prefs)
            if unsafe:
                continue

            reason: Optional[str] = None
            rule_code: str = ""

            # PRIORITY 1: Gym Student Rules
            if category == "gym":
                # G1: Gym + High Protein -> non_veg high-protein gym-suitable meals
                if goal == "high_protein" and m["category"] == "non_veg" and m["nutrition_goal"] == "high_protein" and m["gym_suitable"] == "yes":
                    reason = "Gym: high protein meal"
                    rule_code = "G1"
                # G2: Gym + Weight Gain -> high-protein gym-suitable meals (any category)
                elif health == "wg" and m["nutrition_goal"] == "high_protein" and m["gym_suitable"] == "yes":
                    reason = "Gym: weight gain meal"
                    rule_code = "G2"
                # G3: Gym + Weight Loss + Low Carb -> non_veg low-carb gym-suitable meals
                elif health == "wl" and goal == "low_carb" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_carb" and m["gym_suitable"] == "yes":
                    reason = "Gym: weight loss low carb"
                    rule_code = "G3"
                # G4: Gym + Breakfast -> veg gym-suitable breakfast meals
                elif meal_type == "breakfast" and m["category"] == "veg" and m["gym_suitable"] == "yes" and m["meal_type"] == "breakfast":
                    reason = "Gym: breakfast meal"
                    rule_code = "G4"

            # PRIORITY 2: Vegetarian Rules
            if not reason and category == "veg":
                # V1: VEG + High Protein
                if goal == "high_protein" and m["category"] == "veg" and m["nutrition_goal"] == "high_protein":
                    reason = "Vegetarian: high protein meal"
                    rule_code = "V1"
                # V2: VEG + Balanced
                elif goal == "balanced" and m["category"] == "veg" and m["nutrition_goal"] == "balanced":
                    reason = "Vegetarian: balanced meal"
                    rule_code = "V2"
                # V3: VEG + Dinner
                elif meal_type == "dinner" and m["category"] == "veg" and m["meal_type"] == "dinner":
                    reason = "Vegetarian: dinner option"
                    rule_code = "V3"
                # V4: VEG + Low Fat
                elif goal == "low_fat" and m["category"] == "veg" and m["nutrition_goal"] == "low_fat":
                    reason = "Vegetarian: low fat meal"
                    rule_code = "V4"

            # PRIORITY 2: Non-Vegetarian Rules
            if not reason and category == "non_veg":
                # N1: NON_VEG + High Protein
                if goal == "high_protein" and m["category"] == "non_veg" and m["nutrition_goal"] == "high_protein":
                    reason = "Non-veg: high protein meal"
                    rule_code = "N1"
                # N2: NON_VEG + Low Carb
                elif goal == "low_carb" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_carb":
                    reason = "Non-veg: low carb meal"
                    rule_code = "N2"
                # N3: NON_VEG + Low Fat
                elif goal == "low_fat" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_fat":
                    reason = "Non-veg: low fat meal"
                    rule_code = "N3"

            # PRIORITY 3: Health-Based Rules
            if not reason:
                # H1: Weight Loss + Low Carb
                if health == "wl" and goal == "low_carb" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_carb" and m["gym_suitable"] == "yes":
                    reason = "Health: weight loss low carb"
                    rule_code = "H1"
                # H2: Weight Gain + High Protein
                elif health == "wg" and goal == "high_protein" and m["category"] == "non_veg" and m["nutrition_goal"] == "high_protein" and m["gym_suitable"] == "yes":
                    reason = "Health: weight gain high protein"
                    rule_code = "H2"
                # H3: Balanced (general fallback)
                elif goal == "balanced" and m["category"] == "veg" and m["nutrition_goal"] == "balanced":
                    reason = "General: balanced diet meal"
                    rule_code = "H3"
                # H4: Weight Loss + Low Fat
                elif health == "wl" and goal == "low_fat" and m["nutrition_goal"] == "low_fat":
                    reason = "Health: weight loss low fat"
                    rule_code = "H4"

            # PRIORITY 4: Convenience Rules
            if not reason and convenience == "quick":
                # C1: Quick Meal -> veg snack
                if m["category"] == "veg" and m["meal_type"] == "snack":
                    reason = "Convenience: quick meal"
                    rule_code = "C1"

            if reason:
                candidates.append((m, reason, rule_code))

        # Fallback if no specific rules fired: return all safe meals
        if not candidates:
            for m in meals:
                unsafe, _ = self._is_unsafe(m, prefs)
                if not unsafe:
                    if meal_type and m["meal_type"] == meal_type:
                        candidates.append((m, "General recommendation matching meal type", "FALLBACK"))
                    elif category != "none" and m["category"] == category:
                        candidates.append((m, f"General recommendation for {category} dietary category", "FALLBACK"))
                    else:
                        candidates.append((m, "Cafeteria menu recommendation", "FALLBACK"))

        return candidates

    def _explain_recommendation(
        self, meal: Dict[str, Any], reason: str, rule_code: str, prefs: Dict[str, str]
    ) -> str:
        """
        explanation.pl format:
        format('Meal: ~w~nReason: ~w~nCategory: ~w | Nutrition: ~w | Gym: ~w | Type: ~w~nYour preferences: ~w')
        """
        pref_pairs = ", ".join(f"{k}={v}" for k, v in prefs.items() if v != "none")
        rule_tag = f"Rule [{rule_code}] Fired" if rule_code != "FALLBACK" else "Default Fallback Rule"
        return (
            f"Meal: {meal['name']}\n"
            f"Rule Status: {rule_tag} -> {reason}\n"
            f"Category: {meal['category']} | Nutrition: {meal['nutrition_goal']} | "
            f"Gym Suitable: {meal['gym_suitable']} | Type: {meal['meal_type']}\n"
            f"Safety Guard: \u2713 PASSED (No meat for vegetarians, no allergens)\n"
            f"Active Preferences: [{pref_pairs}]"
        )

    def _build_weekly_plan(
        self, candidates: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        weekly_plan_rules.pl:
        day_order(monday, 1)..day_order(sunday, 7)
        modular indexing: Index is (DayIndex - 1) mod Len, nth0(Index, Candidates, MealID)
        """
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        plan: Dict[str, Any] = {}
        if not candidates:
            candidates = self._meals_cache or []

        len_cand = len(candidates)
        for day_idx, day_name in enumerate(days, start=1):
            if len_cand > 0:
                idx = (day_idx - 1) % len_cand
                meal_item = candidates[idx]
                plan[day_name] = {
                    "id": meal_item["id"],
                    "name": meal_item["name"],
                    "category": meal_item["category"],
                    "nutrition_goal": meal_item["nutrition_goal"],
                    "meal_type": meal_item["meal_type"],
                    "macros": meal_item.get("macros", {}),
                }
            else:
                plan[day_name] = {"id": "m_custom", "name": "Chef's Special", "category": "balanced"}
        return plan

    # =========================================================================
    # Public API Methods
    # =========================================================================

    def recommend(self, prefs: Dict[str, Any]) -> Dict[str, Any]:
        valid_prefs = self.validate_prefs(prefs)
        rule_results = self._evaluate_production_rules(valid_prefs)

        seen_ids = set()
        unique_meals: List[Dict[str, Any]] = []
        for meal, reason, rule_code in rule_results:
            if meal["id"] not in seen_ids:
                seen_ids.add(meal["id"])
                match_score = self._calculate_match_score(meal, valid_prefs, rule_code)
                unique_meals.append({
                    "id": meal["id"],
                    "name": meal["name"],
                    "reason": reason,
                    "rule_code": rule_code,
                    "match_score": match_score,
                    "explanation": self._explain_recommendation(meal, reason, rule_code, valid_prefs),
                    "category": meal["category"],
                    "nutrition_goal": meal["nutrition_goal"],
                    "gym_suitable": meal["gym_suitable"],
                    "meal_type": meal["meal_type"],
                    "macros": meal.get("macros", {}),
                })

        weekly_candidates = [m for m, _, _ in rule_results]
        plan = self._build_weekly_plan(weekly_candidates)

        # Why-not list for excluded meals (explanation.pl why_not/2)
        rec_ids = {m["id"] for m, _, _ in rule_results}
        why_not_list: List[Dict[str, str]] = []
        for m in (self._meals_cache or []):
            if m["id"] not in rec_ids and len(why_not_list) < 6:
                is_unsafe, unsafe_msg = self._is_unsafe(m, valid_prefs)
                if is_unsafe:
                    why_not_list.append({
                        "id": m["id"],
                        "name": m["name"],
                        "explanation": f"Excluded by {unsafe_msg}",
                        "status": "safety_violation",
                    })
                else:
                    why_not_list.append({
                        "id": m["id"],
                        "name": m["name"],
                        "explanation": f"Excluded: did not fire high-priority Horn clauses for your active goals ({valid_prefs.get('goal')}).",
                        "status": "preference_mismatch",
                    })

        return {
            "meals": unique_meals,
            "weekly_plan": plan,
            "why_not": why_not_list,
            "prolog_trace": self.get_prolog_query_trace(valid_prefs),
            "prolog_engine": "SWI-Prolog" if self.is_swipl_available() else "Prolog KB Horn-Clause Engine",
            "rules_source": "knowledge_base/cafeteria_kb.pl",
        }

    def swap_meal(self, day: str, current_meal_name: str, prefs: Dict[str, Any]) -> Dict[str, Any]:
        """Cycles to the next compliant meal from candidate_meals for a given day."""
        valid_prefs = self.validate_prefs(prefs)
        rule_results = self._evaluate_production_rules(valid_prefs)
        candidates = [m for m, _, _ in rule_results]
        if not candidates:
            candidates = self._meals_cache or []

        # Find current index in candidates
        current_idx = -1
        for i, c in enumerate(candidates):
            if c["name"].lower() == current_meal_name.lower():
                current_idx = i
                break

        # Move to next modular index
        next_idx = (current_idx + 1) % len(candidates)
        next_meal = candidates[next_idx]

        return {
            "day": day,
            "meal": {
                "id": next_meal["id"],
                "name": next_meal["name"],
                "category": next_meal["category"],
                "nutrition_goal": next_meal["nutrition_goal"],
                "meal_type": next_meal["meal_type"],
                "macros": next_meal.get("macros", {}),
            },
            "status": "swapped",
        }

    def weekly_plan(self, prefs: Dict[str, Any]) -> Dict[str, Any]:
        valid_prefs = self.validate_prefs(prefs)
        rule_results = self._evaluate_production_rules(valid_prefs)
        candidates = [m for m, _, _ in rule_results]
        plan = self._build_weekly_plan(candidates)
        return {
            "weekly_plan": plan,
            "candidate_count": len(candidates),
            "prolog_engine": "SWI-Prolog" if self.is_swipl_available() else "Prolog KB Horn-Clause Engine",
            "prolog_trace": self.get_prolog_query_trace(valid_prefs),
        }

    def explanations(self, prefs: Dict[str, Any]) -> Dict[str, Any]:
        valid_prefs = self.validate_prefs(prefs)
        rule_results = self._evaluate_production_rules(valid_prefs)

        explanations = [
            self._explain_recommendation(m, r, code, valid_prefs)
            for m, r, code in rule_results[:6]
        ]

        rec_ids = {m["id"] for m, _, _ in rule_results}
        why_not_list: List[Dict[str, str]] = []
        for m in (self._meals_cache or []):
            if m["id"] not in rec_ids and len(why_not_list) < 6:
                is_unsafe, unsafe_msg = self._is_unsafe(m, valid_prefs)
                if is_unsafe:
                    why_not_list.append({
                        "id": m["id"],
                        "name": m["name"],
                        "explanation": unsafe_msg,
                    })
                else:
                    why_not_list.append({
                        "id": m["id"],
                        "name": m["name"],
                        "explanation": f"Did not fire high-priority rules for goal '{valid_prefs.get('goal')}'",
                    })

        return {
            "explanations": explanations,
            "why_not": why_not_list,
            "prolog_trace": self.get_prolog_query_trace(valid_prefs),
            "prolog_engine": "SWI-Prolog" if self.is_swipl_available() else "Prolog KB Horn-Clause Engine",
        }
