const form = document.getElementById("pref-form");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const emptyEl = document.getElementById("empty");
const resetBtn = document.getElementById("reset");
const mealIndex = CafeteriaAPI.listMeals().reduce((acc, meal) => {
  acc[meal.id] = meal;
  return acc;
}, {});

CafeteriaAPI.loadLayout();

function readPrefs() {
  return {
    category: form.category.value,
    goal: form.goal.value,
    health: form.health.value,
    meal_type: form.meal_type.value,
    convenience: form.convenience.value
  };
}

function applyPrefs(prefs) {
  form.category.value = prefs.category || "gym";
  form.goal.value = prefs.goal || "high_protein";
  form.health.value = prefs.health || "none";
  form.meal_type.value = prefs.meal_type || "lunch";
  form.convenience.value = prefs.convenience || "none";
}

function saveLast(prefs, meals) {
  localStorage.setItem("cafeteria_prefs", JSON.stringify(prefs));
  localStorage.setItem("cafeteria_meals", JSON.stringify(meals));
}

function renderRecommendations(meals) {
  resultsEl.innerHTML = "";
  if (!meals.length) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  meals.forEach((meal) => {
    const meta = mealIndex[meal.id];
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${meal.name}</h3>
      <p class="hint">${meal.reason}</p>
      <div class="tag-row">
        <span class="tag">${meta ? meta.category : "category"}</span>
        <span class="tag">${meta ? meta.nutrition : "nutrition"}</span>
        <span class="tag">${meta ? meta.type : "type"}</span>
      </div>
      <a class="btn-outline" href="explanation.html?mealId=${meal.id}">Explain this meal</a>
    `;
    resultsEl.appendChild(card);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "Generating recommendations...";
  const prefs = readPrefs();
  const data = await CafeteriaAPI.getRecommendations(prefs);
  renderRecommendations(data.meals || []);
  saveLast(prefs, data.meals || []);
  statusEl.textContent = data.meals && data.meals.length ? "Recommendations ready." : "No matching meals found.";
});

resetBtn.addEventListener("click", () => {
  applyPrefs({ category: "gym", goal: "high_protein", health: "none", meal_type: "lunch", convenience: "none" });
  resultsEl.innerHTML = "";
  emptyEl.hidden = true;
  statusEl.textContent = "Preferences reset.";
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const preset = button.dataset.preset;
    if (preset === "gym") {
      applyPrefs({ category: "gym", goal: "high_protein", health: "none", meal_type: "lunch", convenience: "none" });
    }
    if (preset === "veg") {
      applyPrefs({ category: "veg", goal: "balanced", health: "none", meal_type: "dinner", convenience: "none" });
    }
    if (preset === "wl") {
      applyPrefs({ category: "non_veg", goal: "low_carb", health: "wl", meal_type: "dinner", convenience: "none" });
    }
    statusEl.textContent = "Preset applied.";
  });
});

const savedPrefs = localStorage.getItem("cafeteria_prefs");
if (savedPrefs) {
  applyPrefs(JSON.parse(savedPrefs));
}
