# Backend Overview — Prolog Expert System Bridge

This backend acts as a thin interface bridge that connects user requests directly to the SWI-Prolog knowledge base (`knowledge_base/cafeteria_kb.pl`).

## Architecture & Reasoning Flow

1. The frontend collects student dietary preferences (Category, Nutritional Goal, Health Objective, Meal Type, Convenience, Allergies).
2. The request is routed to `server.py` (`POST /api/recommend`, `GET/POST /api/weekly-plan`, `GET/POST /api/explanation`).
3. `prolog_bridge.py` queries the Prolog knowledge base:
   - Evaluates production rules ordered by priority (`Priority 1: Gym -> Priority 2: Veg/Non-veg -> Priority 3: Health -> Priority 4: Convenience`).
   - Enforces the `safety_guard` (`unsafe/1`: strict vegetarian meat exclusion and allergen filtering).
   - Generates the 7-day weekly meal plan (`weekly_plan_rules.pl`).
   - Generates rule-trace why and why-not explanations (`explanation.pl`).

## Run Locally

Zero third-party pip dependencies required:

```bash
python app.py
```

The API will be available at http://localhost:5000.
