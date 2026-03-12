const CafeteriaAPI = (() => {
  const API_BASE = window.CAFETERIA_API_BASE || "";

  const MEALS = [
    { id: "m1", name: "Lentil Salad with Boiled Eggs and Nuts", category: "veg", nutrition: "high_protein", gym: "yes", type: "lunch" },
    { id: "m2", name: "Grilled Chicken with Brown Rice", category: "non_veg", nutrition: "high_protein", gym: "yes", type: "lunch" },
    { id: "m3", name: "Vegetable Stir Fry with Tofu", category: "veg", nutrition: "high_protein", gym: "yes", type: "dinner" },
    { id: "m4", name: "Fried Rice with Chicken", category: "non_veg", nutrition: "balanced", gym: "no", type: "lunch" },
    { id: "m5", name: "Oatmeal with Fruits and Nuts", category: "veg", nutrition: "balanced", gym: "yes", type: "breakfast" },
    { id: "m6", name: "Baked Fish with Steamed Vegetables", category: "non_veg", nutrition: "low_carb", gym: "yes", type: "dinner" },
    { id: "m7", name: "Beans with Plantain", category: "veg", nutrition: "balanced", gym: "moderate", type: "lunch" },
    { id: "m8", name: "Fruit Salad", category: "veg", nutrition: "low_carb", gym: "moderate", type: "snack" },
    { id: "m9", name: "Scrambled Eggs with Avocado Toast", category: "veg", nutrition: "high_protein", gym: "yes", type: "breakfast" },
    { id: "m10", name: "Turkey Wrap with Vegetables", category: "non_veg", nutrition: "balanced", gym: "yes", type: "lunch" },
    { id: "m11", name: "Greek Yogurt with Granola and Honey", category: "veg", nutrition: "balanced", gym: "moderate", type: "breakfast" },
    { id: "m12", name: "Beef Stir Fry with Mixed Vegetables", category: "non_veg", nutrition: "high_protein", gym: "yes", type: "dinner" },
    { id: "m13", name: "Chickpea and Quinoa Bowl", category: "veg", nutrition: "high_protein", gym: "yes", type: "lunch" },
    { id: "m14", name: "Protein Smoothie with Banana and Peanut Butter", category: "veg", nutrition: "high_protein", gym: "yes", type: "snack" },
    { id: "m15", name: "Grilled Tilapia with Salad", category: "non_veg", nutrition: "low_carb", gym: "yes", type: "dinner" }
  ];

  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function loadComponent(targetId, path, fallbackHtml) {
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) throw new Error("component load failed");
      target.innerHTML = await res.text();
    } catch (err) {
      target.innerHTML = fallbackHtml;
    }
  }

  async function loadLayout() {
    await loadComponent(
      "navbar",
      "components/navbar.html",
      `<nav class="navbar"><div class="container nav-inner"><a class="brand" href="index.html"><span class="brand-badge">CM</span>Cafeteria Menu Advisor</a><a class="cta" href="recommendation.html">Start</a></div></nav>`
    );
    await loadComponent(
      "footer",
      "components/footer.html",
      `<footer class="footer"><div class="container"><span class="small">Cafeteria Menu Advisor</span></div></footer>`
    );
  }

  function sanitizePrefs(prefs) {
    const cleaned = { ...prefs };
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === "" || cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    return cleaned;
  }

  function isUnsafe(prefs, meal) {
    return prefs.category === "veg" && meal.category === "non_veg";
  }

  function runRules(prefs) {
    const results = [];
    const seen = new Set();

    const addMatches = (filterFn, reason) => {
      MEALS.filter(filterFn).forEach((meal) => {
        if (isUnsafe(prefs, meal)) return;
        if (seen.has(meal.id)) return;
        results.push({ id: meal.id, name: meal.name, reason });
        seen.add(meal.id);
      });
    };

    if (prefs.category === "gym" && prefs.goal === "high_protein") {
      addMatches((m) => m.category === "non_veg" && m.nutrition === "high_protein" && m.gym === "yes", "Gym: high protein meal");
    }
    if (prefs.category === "gym" && prefs.health === "wg") {
      addMatches((m) => m.nutrition === "high_protein" && m.gym === "yes", "Gym: weight gain meal");
    }
    if (prefs.category === "gym" && prefs.health === "wl" && prefs.goal === "low_carb") {
      addMatches((m) => m.category === "non_veg" && m.nutrition === "low_carb" && m.gym === "yes", "Gym: weight loss low carb");
    }
    if (prefs.category === "gym" && prefs.meal_type === "breakfast") {
      addMatches((m) => m.category === "veg" && m.gym === "yes" && m.type === "breakfast", "Gym: breakfast meal");
    }

    if (prefs.category === "veg" && prefs.goal === "high_protein") {
      addMatches((m) => m.category === "veg" && m.nutrition === "high_protein", "Vegetarian: high protein meal");
    }
    if (prefs.category === "veg" && prefs.goal === "balanced") {
      addMatches((m) => m.category === "veg" && m.nutrition === "balanced", "Vegetarian: balanced meal");
    }
    if (prefs.category === "veg" && prefs.meal_type === "dinner") {
      addMatches((m) => m.category === "veg" && m.type === "dinner", "Vegetarian: dinner option");
    }

    if (prefs.category === "non_veg" && prefs.goal === "high_protein") {
      addMatches((m) => m.category === "non_veg" && m.nutrition === "high_protein", "Non-veg: high protein meal");
    }
    if (prefs.category === "non_veg" && prefs.goal === "low_carb") {
      addMatches((m) => m.category === "non_veg" && m.nutrition === "low_carb", "Non-veg: low carb meal");
    }

    if (prefs.health === "wl" && prefs.goal === "low_carb") {
      addMatches((m) => m.category === "non_veg" && m.nutrition === "low_carb" && m.gym === "yes", "Health: weight loss low carb");
    }
    if (prefs.health === "wg" && prefs.goal === "high_protein") {
      addMatches((m) => m.category === "non_veg" && m.nutrition === "high_protein" && m.gym === "yes", "Health: weight gain high protein");
    }
    if (prefs.goal === "balanced") {
      addMatches((m) => m.category === "veg" && m.nutrition === "balanced", "General: balanced diet meal");
    }

    if (prefs.convenience === "quick") {
      addMatches((m) => m.category === "veg" && m.type === "snack", "Convenience: quick meal");
    }

    if (results.length === 0 && prefs.goal === "balanced") {
      addMatches((m) => m.category === "veg" && m.nutrition === "balanced", "General: balanced diet meal");
    }

    return results;
  }

  function weeklyPlanFromPrefs(prefs) {
    const safeRecs = runRules(prefs).map((r) => r.id);
    const candidates = safeRecs.length ? safeRecs : MEALS.map((m) => m.id);
    const plan = {};
    candidates.forEach((id, idx) => {
      const meal = MEALS.find((m) => m.id === id);
      const day = DAYS[idx % DAYS.length];
      plan[day] = meal ? meal.name : "";
    });
    if (Object.keys(plan).length < 7) {
      DAYS.forEach((day, idx) => {
        if (!plan[day]) {
          const meal = MEALS[idx % MEALS.length];
          plan[day] = meal.name;
        }
      });
    }
    return plan;
  }

  function explainRecommendation(mealId, prefs, reasonOverride) {
    const meal = MEALS.find((m) => m.id === mealId);
    if (!meal) return "Meal not found.";
    const prefPairs = Object.entries(prefs).map(([k, v]) => `${k}=${v}`);
    const reason = reasonOverride || "Rule matched your preferences";
    return [
      `Meal: ${meal.name}`,
      `Reason: ${reason}`,
      `Category: ${meal.category} | Nutrition: ${meal.nutrition} | Gym: ${meal.gym} | Type: ${meal.type}`,
      `Your preferences: [${prefPairs.join(", ")}]`
    ].join("\n");
  }

  async function requestJson(path, prefs) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error("API request failed");
    return res.json();
  }

  async function getRecommendations(prefs) {
    const cleaned = sanitizePrefs(prefs);
    if (API_BASE) {
      try {
        return await requestJson("/recommendations", cleaned);
      } catch (err) {
        await sleep(200);
      }
    }
    const meals = runRules(cleaned);
    const weekly_plan = weeklyPlanFromPrefs(cleaned);
    return { meals, weekly_plan };
  }

  async function getWeeklyPlan(prefs) {
    const cleaned = sanitizePrefs(prefs);
    if (API_BASE) {
      try {
        const data = await requestJson("/weekly-plan", cleaned);
        return data;
      } catch (err) {
        await sleep(200);
      }
    }
    return { weekly_plan: weeklyPlanFromPrefs(cleaned) };
  }

  async function getExplanation(prefs, mealId, reason) {
    const cleaned = sanitizePrefs(prefs);
    if (API_BASE) {
      try {
        return await requestJson("/explanation", { ...cleaned, meal_id: mealId });
      } catch (err) {
        await sleep(200);
      }
    }
    return { explanation: explainRecommendation(mealId, cleaned, reason) };
  }

  function listMeals() {
    return MEALS.map((m) => ({ ...m }));
  }

  return {
    loadLayout,
    getRecommendations,
    getWeeklyPlan,
    getExplanation,
    listMeals
  };
})();
