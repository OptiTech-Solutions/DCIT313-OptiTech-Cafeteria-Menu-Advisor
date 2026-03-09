%%  explanation.pl  —  Why-Explanation / Rule Trace
%%  ────────────────────────────────────────────────
%%  Provides human-readable explanations for why a meal
%%  was recommended, tracing which rules were fired.

:- dynamic user_preference/2.

%% explain_recommendation/2
%%  Given a MealID, produces a human-readable Explanation string
%%  describing which user preferences matched and why the meal was chosen.
explain_recommendation(MealID, Explanation) :-
    safe_recommend(MealID, MealName, Reason),
    meal(MealID, _, Category, Nutrition, GymSuitable, MealType),
    collect_user_prefs(PrefsList),
    format(atom(Explanation),
        'Meal: ~w~nReason: ~w~nCategory: ~w | Nutrition: ~w | Gym: ~w | Type: ~w~nYour preferences: ~w',
        [MealName, Reason, Category, Nutrition, GymSuitable, MealType, PrefsList]).

%% collect_user_prefs/1
%%  Gathers all currently asserted user_preference/2 facts into a list
%%  of Key=Value pairs for display.
collect_user_prefs(PrefsList) :-
    findall(
        Key=Value,
        user_preference(Key, Value),
        PrefsList
    ).

%% explain_all/1
%%  Produces a list of explanations for every recommended meal.
explain_all(Explanations) :-
    findall(
        explain(MealID, MealName, Reason),
        safe_recommend(MealID, MealName, Reason),
        Explanations
    ).

%% why_not/2
%%  Explains why a specific meal was NOT recommended.
%%  Checks safety constraints and preference mismatches.
why_not(MealID, Explanation) :-
    meal(MealID, MealName, _, _, _, _),
    (   unsafe(MealID)
    ->  format(atom(Explanation),
            '~w (ID: ~w) was excluded because it violates your dietary safety constraints (e.g., non-veg meal for a vegetarian).',
            [MealName, MealID])
    ;   \+ recommend(MealID, _, _)
    ->  format(atom(Explanation),
            '~w (ID: ~w) did not match any of your current preferences.',
            [MealName, MealID])
    ;   format(atom(Explanation),
            '~w (ID: ~w) is actually a valid recommendation for your preferences.',
            [MealName, MealID])
    ).
