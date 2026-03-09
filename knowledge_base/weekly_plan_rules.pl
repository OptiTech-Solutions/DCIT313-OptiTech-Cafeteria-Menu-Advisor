%%  weekly_plan_rules.pl  —  7-Day Balanced Meal Plan Rules
%%  ─────────────────────────────────────────────────────────
%%  Generates a weekly meal plan based on user preferences.
%%  Ensures variety by assigning different meals to each day.

:- dynamic user_preference/2.

%% day/1 — The seven days of the week, in order.
day(monday).
day(tuesday).
day(wednesday).
day(thursday).
day(friday).
day(saturday).
day(sunday).

%% day_order/2 — Maps each day to a numeric index for selection.
day_order(monday,    1).
day_order(tuesday,   2).
day_order(wednesday, 3).
day_order(thursday,  4).
day_order(friday,    5).
day_order(saturday,  6).
day_order(sunday,    7).

%% candidate_meals/1 — Collects all safe meal IDs that match user prefs.
%%  Falls back to all meals if no production rules fire.
candidate_meals(Meals) :-
    findall(ID, safe_recommend(ID, _, _), SafeMeals),
    (   SafeMeals \= []
    ->  Meals = SafeMeals
    ;   findall(ID, meal(ID, _, _, _, _, _), Meals)
    ).

%% pick_meal/3 — Selects a meal from the candidate list using modular
%%  indexing to rotate through available options and avoid repetition.
%%  DayIndex is 1-based (Monday=1 … Sunday=7).
pick_meal(DayIndex, Candidates, MealName) :-
    length(Candidates, Len),
    Len > 0,
    Index is (DayIndex - 1) mod Len,
    nth0(Index, Candidates, MealID),
    meal(MealID, MealName, _, _, _, _).

%% weekly_plan/1 — Produces a list of Day-MealName pairs for 7 days.
%%  Example result:
%%    [monday-'Oatmeal with Fruits and Nuts',
%%     tuesday-'Grilled Chicken with Brown Rice', ...]
weekly_plan(Plan) :-
    candidate_meals(Candidates),
    findall(
        Day-MealName,
        (   day(Day),
            day_order(Day, DayIdx),
            pick_meal(DayIdx, Candidates, MealName)
        ),
        Plan
    ),
    length(Plan, 7).
