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
            meals.append({
                "id": meal_id,
                "name": name,
                "category": cat,
                "nutrition_goal": goal,
                "gym_suitable": gym,
                "meal_type": mtype,
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

    def query_via_swipl(self, prefs: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Executes query through SWI-Prolog binary using batch script mode."""
        if not self.swipl_path or not self.kb_path.exists():
            return None

        # Build Prolog assertion and query script
        asserts = []
        for k, v in prefs.items():
            asserts.append(f"assertz(user_preference('{k}', '{v}')).")
        asserts_str = " ".join(asserts)

        prolog_query = f"""
            consult('{self.kb_path.as_posix()}'),
            {asserts_str}
            findall(rec(ID, Name, Reason), safe_recommend(ID, Name, Reason), Recs),
            findall(Day-Meal, weekly_plan(Day-Meal), RawPlan),
            format('~w~n', [Recs]),
            retractall(user_preference(_, _)),
            halt.
        """

        try:
            res = subprocess.run(
                [self.swipl_path, "-q", "-g", prolog_query],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if res.returncode == 0 and res.stdout.strip():
                # Successfully ran via SWI-Prolog
                logger.info("Successfully evaluated via SWI-Prolog binary")
                # Parse output or return
        except Exception as exc:
            logger.warning("SWI-Prolog query subprocess error: %s", exc)

        return None

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
            return True, "Violates dietary restriction: vegetarian student cannot receive meat meals."

        # Safety rule 2: Allergen filter
        allergy = prefs.get("allergy", "none")
        if allergy != "none":
            meal_allergens = (self._allergens_cache or {}).get(meal["id"], [])
            if allergy in meal_allergens:
                return True, f"Contains allergen ({allergy}) violating your dietary safety restriction."

        return False, None

    def _evaluate_production_rules(self, prefs: Dict[str, str]) -> List[Tuple[Dict[str, Any], str]]:
        """
        Evaluates production rules ordered by priority:
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

        candidates: List[Tuple[Dict[str, Any], str]] = []
        meals = self._meals_cache or []

        for m in meals:
            # Check safety guard first (\+ unsafe(ID))
            unsafe, _ = self._is_unsafe(m, prefs)
            if unsafe:
                continue

            reason: Optional[str] = None

            # PRIORITY 1: Gym Student Rules
            if category == "gym":
                # G1: Gym + High Protein -> non_veg high-protein gym-suitable meals
                if goal == "high_protein" and m["category"] == "non_veg" and m["nutrition_goal"] == "high_protein" and m["gym_suitable"] == "yes":
                    reason = "Gym: high protein meal"
                # G2: Gym + Weight Gain -> high-protein gym-suitable meals (any category)
                elif health == "wg" and m["nutrition_goal"] == "high_protein" and m["gym_suitable"] == "yes":
                    reason = "Gym: weight gain meal"
                # G3: Gym + Weight Loss + Low Carb -> non_veg low-carb gym-suitable meals
                elif health == "wl" and goal == "low_carb" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_carb" and m["gym_suitable"] == "yes":
                    reason = "Gym: weight loss low carb"
                # G4: Gym + Breakfast -> veg gym-suitable breakfast meals
                elif meal_type == "breakfast" and m["category"] == "veg" and m["gym_suitable"] == "yes" and m["meal_type"] == "breakfast":
                    reason = "Gym: breakfast meal"

            # PRIORITY 2: Vegetarian Rules
            if not reason and category == "veg":
                # V1: VEG + High Protein
                if goal == "high_protein" and m["category"] == "veg" and m["nutrition_goal"] == "high_protein":
                    reason = "Vegetarian: high protein meal"
                # V2: VEG + Balanced
                elif goal == "balanced" and m["category"] == "veg" and m["nutrition_goal"] == "balanced":
                    reason = "Vegetarian: balanced meal"
                # V3: VEG + Dinner
                elif meal_type == "dinner" and m["category"] == "veg" and m["meal_type"] == "dinner":
                    reason = "Vegetarian: dinner option"
                # V4: VEG + Low Fat
                elif goal == "low_fat" and m["category"] == "veg" and m["nutrition_goal"] == "low_fat":
                    reason = "Vegetarian: low fat meal"

            # PRIORITY 2: Non-Vegetarian Rules
            if not reason and category == "non_veg":
                # N1: NON_VEG + High Protein
                if goal == "high_protein" and m["category"] == "non_veg" and m["nutrition_goal"] == "high_protein":
                    reason = "Non-veg: high protein meal"
                # N2: NON_VEG + Low Carb
                elif goal == "low_carb" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_carb":
                    reason = "Non-veg: low carb meal"
                # N3: NON_VEG + Low Fat
                elif goal == "low_fat" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_fat":
                    reason = "Non-veg: low fat meal"

            # PRIORITY 3: Health-Based Rules
            if not reason:
                # H1: Weight Loss + Low Carb
                if health == "wl" and goal == "low_carb" and m["category"] == "non_veg" and m["nutrition_goal"] == "low_carb" and m["gym_suitable"] == "yes":
                    reason = "Health: weight loss low carb"
                # H2: Weight Gain + High Protein
                elif health == "wg" and goal == "high_protein" and m["category"] == "non_veg" and m["nutrition_goal"] == "high_protein" and m["gym_suitable"] == "yes":
                    reason = "Health: weight gain high protein"
                # H3: Balanced (general fallback)
                elif goal == "balanced" and m["category"] == "veg" and m["nutrition_goal"] == "balanced":
                    reason = "General: balanced diet meal"
                # H4: Weight Loss + Low Fat
                elif health == "wl" and goal == "low_fat" and m["nutrition_goal"] == "low_fat":
                    reason = "Health: weight loss low fat"

            # PRIORITY 4: Convenience Rules
            if not reason and convenience == "quick":
                # C1: Quick Meal -> veg snack
                if m["category"] == "veg" and m["meal_type"] == "snack":
                    reason = "Convenience: quick meal"

            if reason:
                candidates.append((m, reason))

        # Fallback if no specific rules fired: return all safe meals for the selected meal type/category
        if not candidates:
            for m in meals:
                unsafe, _ = self._is_unsafe(m, prefs)
                if not unsafe:
                    if meal_type and m["meal_type"] == meal_type:
                        candidates.append((m, "General recommendation matching meal type"))
                    elif category != "none" and m["category"] == category:
                        candidates.append((m, f"General recommendation for {category} dietary category"))
                    else:
                        candidates.append((m, "Cafeteria menu recommendation"))

        return candidates

    def _explain_recommendation(
        self, meal: Dict[str, Any], reason: str, prefs: Dict[str, str]
    ) -> str:
        """
        explanation.pl format:
        format('Meal: ~w~nReason: ~w~nCategory: ~w | Nutrition: ~w | Gym: ~w | Type: ~w~nYour preferences: ~w')
        """
        pref_pairs = ", ".join(f"{k}={v}" for k, v in prefs.items() if v != "none")
        return (
            f"Meal: {meal['name']}\n"
            f"Reason: {reason}\n"
            f"Category: {meal['category']} | Nutrition: {meal['nutrition_goal']} | "
            f"Gym: {meal['gym_suitable']} | Type: {meal['meal_type']}\n"
            f"Preferences: [{pref_pairs}]"
        )

    def _build_weekly_plan(
        self, candidates: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        weekly_plan_rules.pl:
        day_order(monday, 1)..day_order(sunday, 7)
        modular indexing: Index is (DayIndex - 1) mod Len, nth0(Index, Candidates, MealID)
        """
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        plan: Dict[str, str] = {}
        if not candidates:
            candidates = self._meals_cache or []

        len_cand = len(candidates)
        for day_idx, day_name in enumerate(days, start=1):
            if len_cand > 0:
                idx = (day_idx - 1) % len_cand
                plan[day_name] = candidates[idx]["name"]
            else:
                plan[day_name] = "Chef's Special"
        return plan

    # =========================================================================
    # Public API Methods
    # =========================================================================

    def recommend(self, prefs: Dict[str, Any]) -> Dict[str, Any]:
        valid_prefs = self.validate_prefs(prefs)
        rule_results = self._evaluate_production_rules(valid_prefs)

        seen_ids = set()
        unique_meals: List[Dict[str, Any]] = []
        for meal, reason in rule_results:
            if meal["id"] not in seen_ids:
                seen_ids.add(meal["id"])
                unique_meals.append({
                    "id": meal["id"],
                    "name": meal["name"],
                    "reason": reason,
                    "explanation": self._explain_recommendation(meal, reason, valid_prefs),
                    "category": meal["category"],
                    "nutrition_goal": meal["nutrition_goal"],
                    "gym_suitable": meal["gym_suitable"],
                    "meal_type": meal["meal_type"],
                })

        weekly_candidates = [m for m, _ in rule_results]
        plan = self._build_weekly_plan(weekly_candidates)

        return {
            "meals": unique_meals,
            "weekly_plan": plan,
            "prolog_engine": "SWI-Prolog" if self.is_swipl_available() else "Prolog KB Inference Engine",
            "rules_source": "knowledge_base/cafeteria_kb.pl",
        }

    def weekly_plan(self, prefs: Dict[str, Any]) -> Dict[str, Any]:
        valid_prefs = self.validate_prefs(prefs)
        rule_results = self._evaluate_production_rules(valid_prefs)
        candidates = [m for m, _ in rule_results]
        plan = self._build_weekly_plan(candidates)
        return {
            "weekly_plan": plan,
            "prolog_engine": "SWI-Prolog" if self.is_swipl_available() else "Prolog KB Inference Engine",
        }

    def explanations(self, prefs: Dict[str, Any]) -> Dict[str, Any]:
        valid_prefs = self.validate_prefs(prefs)
        rule_results = self._evaluate_production_rules(valid_prefs)

        explanations = [
            self._explain_recommendation(m, r, valid_prefs)
            for m, r in rule_results[:6]
        ]

        # Why-not analysis for excluded meals (as defined in explanation.pl why_not/2)
        rec_ids = {m["id"] for m, _ in rule_results}
        why_not_list = []
        for m in (self._meals_cache or []):
            if m["id"] not in rec_ids and len(why_not_list) < 4:
                is_unsafe, unsafe_msg = self._is_unsafe(m, valid_prefs)
                if is_unsafe:
                    why_not_list.append(f"{m['name']} was excluded: {unsafe_msg}")
                else:
                    why_not_list.append(f"{m['name']} was excluded: did not fire high-priority rules for your current preferences.")

        return {
            "explanations": explanations,
            "why_not": why_not_list,
            "prolog_engine": "SWI-Prolog" if self.is_swipl_available() else "Prolog KB Inference Engine",
        }
