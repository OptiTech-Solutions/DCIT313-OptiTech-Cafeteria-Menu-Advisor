%%  tests.pl  —  Prolog Unit Tests (plunit)
%%  ──────────────────────────────────────────
%%  Run with:  swipl -g "run_tests, halt" knowledge_base/tests.pl
%%
%%  Each test asserts preferences, runs a query, checks the result,
%%  then retracts all preferences to keep sessions clean.

:- use_module(library(plunit)).
:- consult('cafeteria_kb.pl').

:- begin_tests(cafeteria).

%% Test 1: Gym + high protein returns at least one result
test(gym_high_protein_returns_results) :-
    assertz(user_preference(category, gym)),
    assertz(user_preference(goal, high_protein)),
    findall(ID, safe_recommend(ID, _, _), IDs),
    IDs \= [],
    retractall(user_preference(_, _)).

%% Test 2: Vegetarians never receive meat meals
test(veg_no_meat) :-
    assertz(user_preference(category, veg)),
    assertz(user_preference(goal, high_protein)),
    \+ safe_recommend(m2, _, _),
    \+ safe_recommend(m12, _, _),
    retractall(user_preference(_, _)).

%% Test 3: Weekly plan always returns exactly 7 days
test(weekly_plan_seven_days) :-
    assertz(user_preference(category, veg)),
    assertz(user_preference(goal, balanced)),
    weekly_plan(Plan),
    length(Plan, 7),
    retractall(user_preference(_, _)).

%% Test 4: Gym + weight loss + low carb returns results
test(gym_weight_loss_low_carb) :-
    assertz(user_preference(category, gym)),
    assertz(user_preference(health, wl)),
    assertz(user_preference(goal, low_carb)),
    findall(ID, safe_recommend(ID, _, _), IDs),
    IDs \= [],
    retractall(user_preference(_, _)).

%% Test 5: Convenience quick meal returns snack items
test(quick_meal_returns_snacks) :-
    assertz(user_preference(convenience, quick)),
    findall(ID, safe_recommend(ID, _, _), IDs),
    IDs \= [],
    retractall(user_preference(_, _)).

%% Test 6: Non-veg + low carb returns correct meals
test(non_veg_low_carb) :-
    assertz(user_preference(category, non_veg)),
    assertz(user_preference(goal, low_carb)),
    findall(ID, safe_recommend(ID, _, _), IDs),
    member(m6, IDs),
    member(m15, IDs),
    retractall(user_preference(_, _)).

%% Test 7: Explanation engine returns non-empty explanation
test(explanation_returns_text) :-
    assertz(user_preference(category, veg)),
    assertz(user_preference(goal, high_protein)),
    explain_recommendation(m1, Explanation),
    atom_length(Explanation, Len),
    Len > 0,
    retractall(user_preference(_, _)).

:- end_tests(cafeteria).