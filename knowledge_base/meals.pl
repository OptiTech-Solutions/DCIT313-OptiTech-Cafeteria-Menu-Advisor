%%  meals.pl  —  Meal Database (15 cafeteria meals)
%%  ─────────────────────────────────────────────────
%%  Pure structured facts — NO logic lives here.
%%
%%  meal(+ID, +Name, +Category, +NutritionGoal, +GymSuitable, +MealType).
%%
%%  Category     :  veg | non_veg
%%  Nutrition    :  high_protein | low_carb | low_fat | balanced
%%  GymSuitable  :  yes | moderate | no
%%  MealType     :  breakfast | lunch | dinner | snack

meal(m1,  'Lentil Salad with Boiled Eggs and Nuts',
     veg,      high_protein, yes,      lunch).

meal(m2,  'Grilled Chicken with Brown Rice',
     non_veg,  high_protein, yes,      lunch).

meal(m3,  'Vegetable Stir Fry with Tofu',
     veg,      high_protein, yes,      dinner).

meal(m4,  'Fried Rice with Chicken',
     non_veg,  balanced,     no,       lunch).

meal(m5,  'Oatmeal with Fruits and Nuts',
     veg,      balanced,     yes,      breakfast).

meal(m6,  'Baked Fish with Steamed Vegetables',
     non_veg,  low_carb,     yes,      dinner).

meal(m7,  'Beans with Plantain',
     veg,      balanced,     moderate, lunch).

meal(m8,  'Fruit Salad',
     veg,      low_carb,     moderate, snack).

meal(m9,  'Scrambled Eggs with Avocado Toast',
     veg,      high_protein, yes,      breakfast).

meal(m10, 'Turkey Wrap with Vegetables',
     non_veg,  balanced,     yes,      lunch).

meal(m11, 'Greek Yogurt with Granola and Honey',
     veg,      balanced,     moderate, breakfast).

meal(m12, 'Beef Stir Fry with Mixed Vegetables',
     non_veg,  high_protein, yes,      dinner).

meal(m13, 'Chickpea and Quinoa Bowl',
     veg,      high_protein, yes,      lunch).

meal(m14, 'Protein Smoothie with Banana and Peanut Butter',
     veg,      high_protein, yes,      snack).

meal(m15, 'Grilled Tilapia with Salad',
     non_veg,  low_carb,     yes,      dinner).
