%%  production_rules.pl  —  IF-THEN Production Rules
%%  ------------------------------------------------------------
%%  All reasoning intelligence lives here as Prolog Horn clauses.
%%  Rules are ordered by priority:
%%      Priority 1 (highest)  —  Gym Student Rules       (G1–G4)
%%      Priority 2            —  Vegetarian Rules         (V1–V4)
%%      Priority 2            —  Non-Vegetarian Rules     (N1–N3)
%%      Priority 3            —  Health-Based Rules       (H1–H4)
%%      Priority 4 (lowest)   —  Convenience Rules        (C1)

%% ------------------------------------------------------------
%%  Dynamic Facts Declaration
%% ------------------------------------------------------------
%%  User preferences are asserted at runtime — never hardcoded.

:- dynamic user_preference/2.

%% user_preference(category,    veg | non_veg | gym | none).
%% user_preference(goal,        high_protein | low_carb | low_fat | balanced).
%% user_preference(health,      wl | wg | none).
%% user_preference(meal_type,   breakfast | lunch | dinner | snack).
%% user_preference(convenience, quick | none).
%% user_preference(allergy,     none | nuts | dairy | gluten | seafood).


%% ============================================================
%%  PRIORITY 1 — Gym Student Rules
%% ============================================================

%% G1: GYM + High Protein -> non_veg high-protein gym-suitable meals
recommend(ID, Name, 'Gym: high protein meal') :-
    user_preference(category, gym),
    user_preference(goal, high_protein),
    meal(ID, Name, non_veg, high_protein, yes, _).

%% G2: GYM + Weight Gain -> high-protein gym-suitable meals (any category)
recommend(ID, Name, 'Gym: weight gain meal') :-
    user_preference(category, gym),
    user_preference(health, wg),
    meal(ID, Name, _, high_protein, yes, _).

%% G3: GYM + Weight Loss + Low Carb -> non_veg low-carb gym-suitable meals
recommend(ID, Name, 'Gym: weight loss low carb') :-
    user_preference(category, gym),
    user_preference(health, wl),
    user_preference(goal, low_carb),
    meal(ID, Name, non_veg, low_carb, yes, _).

%% G4: GYM + Breakfast -> veg gym-suitable breakfast meals
recommend(ID, Name, 'Gym: breakfast meal') :-
    user_preference(category, gym),
    user_preference(meal_type, breakfast),
    meal(ID, Name, veg, _, yes, breakfast).


%% ============================================================
%%  PRIORITY 2 — Vegetarian Rules
%% ============================================================

%% V1: VEG + High Protein -> veg high-protein meals
recommend(ID, Name, 'Vegetarian: high protein meal') :-
    user_preference(category, veg),
    user_preference(goal, high_protein),
    meal(ID, Name, veg, high_protein, _, _).

%% V2: VEG + Balanced -> veg balanced meals
recommend(ID, Name, 'Vegetarian: balanced meal') :-
    user_preference(category, veg),
    user_preference(goal, balanced),
    meal(ID, Name, veg, balanced, _, _).

%% V3: VEG + Dinner -> veg dinner options
recommend(ID, Name, 'Vegetarian: dinner option') :-
    user_preference(category, veg),
    user_preference(meal_type, dinner),
    meal(ID, Name, veg, _, _, dinner).

%% V4: VEG + Low Fat -> veg low-fat meals
recommend(ID, Name, 'Vegetarian: low fat meal') :-
    user_preference(category, veg),
    user_preference(goal, low_fat),
    meal(ID, Name, veg, low_fat, _, _).


%% ============================================================
%%  PRIORITY 2 — Non-Vegetarian Rules
%% ============================================================

%% N1: NON_VEG + High Protein -> non_veg high-protein meals
recommend(ID, Name, 'Non-veg: high protein meal') :-
    user_preference(category, non_veg),
    user_preference(goal, high_protein),
    meal(ID, Name, non_veg, high_protein, _, _).

%% N2: NON_VEG + Low Carb -> non_veg low-carb meals
recommend(ID, Name, 'Non-veg: low carb meal') :-
    user_preference(category, non_veg),
    user_preference(goal, low_carb),
    meal(ID, Name, non_veg, low_carb, _, _).

%% N3: NON_VEG + Low Fat -> non_veg low-fat meals
recommend(ID, Name, 'Non-veg: low fat meal') :-
    user_preference(category, non_veg),
    user_preference(goal, low_fat),
    meal(ID, Name, non_veg, low_fat, _, _).


%% ============================================================
%%  PRIORITY 3 — Health-Based Rules
%% ============================================================

%% H1: Weight Loss + Low Carb -> non_veg low-carb gym-suitable meals
recommend(ID, Name, 'Health: weight loss low carb') :-
    user_preference(health, wl),
    user_preference(goal, low_carb),
    meal(ID, Name, non_veg, low_carb, yes, _).

%% H2: Weight Gain + High Protein -> non_veg high-protein gym-suitable meals
recommend(ID, Name, 'Health: weight gain high protein') :-
    user_preference(health, wg),
    user_preference(goal, high_protein),
    meal(ID, Name, non_veg, high_protein, yes, _).

%% H3: Balanced (general fallback) -> veg balanced meals
recommend(ID, Name, 'General: balanced diet meal') :-
    user_preference(goal, balanced),
    meal(ID, Name, veg, balanced, _, _).

%% H4: Weight Loss + Low Fat -> low-fat meals (any category)
recommend(ID, Name, 'Health: weight loss low fat') :-
    user_preference(health, wl),
    user_preference(goal, low_fat),
    meal(ID, Name, _, low_fat, _, _).


%% ============================================================
%%  PRIORITY 4 — Convenience Rules
%% ============================================================

%% C1: Quick Meal -> veg snack meals
recommend(ID, Name, 'Convenience: quick meal') :-
    user_preference(convenience, quick),
    meal(ID, Name, veg, _, _, snack).


%% ============================================================
%%  SAFETY GUARD
%% ============================================================

%% unsafe/1 — Prevents vegetarians from receiving meat meals.
unsafe(ID) :-
    user_preference(category, veg),
    meal(ID, _, non_veg, _, _, _).

%% unsafe/1 — Filters meals containing allergens selected by user.
unsafe(ID) :-
    user_preference(allergy, Allergy),
    Allergy \= none,
    meal_allergen(ID, Allergy).

%% safe_recommend/3 — USE THIS from Python, not recommend/3 directly.
%% Filters out any recommendation that violates safety constraints.
safe_recommend(ID, Name, Reason) :-
    recommend(ID, Name, Reason),
    \+ unsafe(ID).
