export const MEAL_DB = {
  m1:  { name: "Lentil Salad with Boiled Eggs & Nuts",        cat: "veg",     cal: "Medium", type: "lunch",     badge: "High Protein" },
  m2:  { name: "Grilled Chicken with Brown Rice",             cat: "non_veg", cal: "High",   type: "lunch",     badge: "High Protein" },
  m3:  { name: "Vegetable Stir Fry with Tofu",                cat: "veg",     cal: "Medium", type: "dinner",    badge: "High Protein" },
  m4:  { name: "Fried Rice with Chicken",                     cat: "non_veg", cal: "High",   type: "lunch",     badge: "Balanced"     },
  m5:  { name: "Oatmeal with Fruits & Nuts",                  cat: "veg",     cal: "Medium", type: "breakfast", badge: "Balanced"     },
  m6:  { name: "Baked Fish with Steamed Vegetables",          cat: "non_veg", cal: "Medium", type: "dinner",    badge: "Low Carb"     },
  m7:  { name: "Beans with Plantain",                         cat: "veg",     cal: "High",   type: "lunch",     badge: "Balanced"     },
  m8:  { name: "Fruit Salad",                                 cat: "veg",     cal: "Low",    type: "snack",     badge: "Low Carb"     },
  m9:  { name: "Scrambled Eggs with Avocado Toast",           cat: "veg",     cal: "Medium", type: "breakfast", badge: "High Protein" },
  m10: { name: "Turkey Wrap with Vegetables",                 cat: "non_veg", cal: "Medium", type: "lunch",     badge: "Balanced"     },
  m11: { name: "Greek Yogurt with Granola & Honey",           cat: "veg",     cal: "Medium", type: "breakfast", badge: "Balanced"     },
  m12: { name: "Beef Stir Fry with Mixed Vegetables",         cat: "non_veg", cal: "High",   type: "dinner",    badge: "High Protein" },
  m13: { name: "Chickpea and Quinoa Bowl",                    cat: "veg",     cal: "Medium", type: "lunch",     badge: "High Protein" },
  m14: { name: "Protein Smoothie (Banana & Peanut Butter)",   cat: "veg",     cal: "Medium", type: "snack",     badge: "High Protein" },
  m15: { name: "Grilled Tilapia with Salad",                  cat: "non_veg", cal: "Low",    type: "dinner",    badge: "Low Carb"     },
};

export const ALLERGY_OPTIONS = [
  { value: "nuts",   label: "Nuts",   icon: "🥜" },
  { value: "dairy",  label: "Dairy",  icon: "🥛" },
  { value: "eggs",   label: "Eggs",   icon: "🥚" },
  { value: "fish",   label: "Fish",   icon: "🐟" },
  { value: "gluten", label: "Gluten", icon: "🌾" },
  { value: "soy",    label: "Soy",    icon: "🫘" },
];

export const STEPS = ["category", "goal", "health", "meal_type", "convenience"];

export const STEP_CONFIG = {
  category: {
    label: "Who are you?",
    sub: "Tell us about your dietary preference",
    options: [
      { value: "veg",     label: "Vegetarian",      icon: "🥗", desc: "Plant-based meals only"    },
      { value: "non_veg", label: "Non-Vegetarian",  icon: "🍗", desc: "All meals available"       },
      { value: "gym",     label: "Gym Student",     icon: "💪", desc: "High-performance fuel"     },
      { value: "none",    label: "No Restriction",  icon: "🍽️", desc: "Everything goes"           },
    ],
  },
  goal: {
    label: "Nutritional Goal",
    sub: "What are you optimizing for?",
    options: [
      { value: "high_protein", label: "High Protein",  icon: "🥩", desc: "Build & repair muscle"   },
      { value: "low_carb",     label: "Low Carb",      icon: "🥦", desc: "Reduce carbohydrates"    },
      { value: "low_fat",      label: "Low Fat",       icon: "🫐", desc: "Keep fats in check"      },
      { value: "balanced",     label: "Balanced Diet", icon: "⚖️", desc: "Well-rounded nutrition"  },
    ],
  },
  health: {
    label: "Health Objective",
    sub: "Any specific health goal?",
    options: [
      { value: "wl",   label: "Weight Loss",      icon: "📉", desc: "Lean, calorie-smart meals" },
      { value: "wg",   label: "Weight Gain",      icon: "📈", desc: "Calorie-dense options"     },
      { value: "none", label: "No Specific Goal", icon: "😌", desc: "Just eat well"             },
    ],
  },
  meal_type: {
    label: "Meal Time",
    sub: "Which meal are you planning?",
    options: [
      { value: "breakfast", label: "Breakfast", icon: "🌅", desc: "Start your day right"    },
      { value: "lunch",     label: "Lunch",     icon: "☀️", desc: "Midday energy boost"     },
      { value: "dinner",    label: "Dinner",    icon: "🌙", desc: "Evening nourishment"     },
      { value: "snack",     label: "Snack",     icon: "🍌", desc: "Quick bite between meals"},
    ],
  },
  convenience: {
    label: "Convenience",
    sub: "How much time do you have?",
    options: [
      { value: "quick", label: "Quick Meal",     icon: "⚡", desc: "Ready in minutes"       },
      { value: "none",  label: "No Preference",  icon: "🕐", desc: "Time is not a concern"  },
    ],
  },
};

export const MEAL_EMOJI = {
  breakfast: "🍳", lunch: "🥘", dinner: "🍲", snack: "🍎",
};

export const CAL_COLOR = {
  Low:    "text-emerald-600 bg-emerald-50",
  Medium: "text-amber-600 bg-amber-50",
  High:   "text-rose-600 bg-rose-50",
};

export const BADGE_COLOR = {
  "High Protein": "bg-blue-100 text-blue-700",
  "Low Carb":     "bg-green-100 text-green-700",
  "Balanced":     "bg-purple-100 text-purple-700",
  "Low Fat":      "bg-orange-100 text-orange-700",
};
