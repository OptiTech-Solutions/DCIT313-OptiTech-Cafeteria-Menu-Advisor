const explainForm = document.getElementById("explain-form");
const statusEl = document.getElementById("status");
const explanationEl = document.getElementById("explanation");
const resetBtn = document.getElementById("reset");
const loadLastBtn = document.getElementById("load-last");
const mealSelect = document.getElementById("meal_id");

CafeteriaAPI.loadLayout();

const meals = CafeteriaAPI.listMeals();

function populateMeals(selectedId) {
  mealSelect.innerHTML = "";
  meals.forEach((meal) => {
    const option = document.createElement("option");
    option.value = meal.id;
    option.textContent = `${meal.name} (${meal.id})`;
    if (meal.id === selectedId) option.selected = true;
    mealSelect.appendChild(option);
  });
}

function readPrefs() {
  return {
    category: explainForm.category.value,
    goal: explainForm.goal.value,
    health: explainForm.health.value,
    meal_type: explainForm.meal_type.value,
    convenience: explainForm.convenience.value
  };
}

function applyPrefs(prefs) {
  explainForm.category.value = prefs.category || "gym";
  explainForm.goal.value = prefs.goal || "high_protein";
  explainForm.health.value = prefs.health || "none";
  explainForm.meal_type.value = prefs.meal_type || "lunch";
  explainForm.convenience.value = prefs.convenience || "none";
}

function getReason(mealId) {
  const lastMeals = JSON.parse(localStorage.getItem("cafeteria_meals") || "[]");
  const match = lastMeals.find((m) => m.id === mealId);
  return match ? match.reason : "";
}

explainForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "Building explanation...";
  const prefs = readPrefs();
  const mealId = mealSelect.value;
  const reason = getReason(mealId);
  const data = await CafeteriaAPI.getExplanation(prefs, mealId, reason);
  explanationEl.textContent = data.explanation || "No explanation returned.";
  localStorage.setItem("cafeteria_prefs", JSON.stringify(prefs));
  statusEl.textContent = "Explanation ready.";
});

resetBtn.addEventListener("click", () => {
  applyPrefs({ category: "gym", goal: "high_protein", health: "none", meal_type: "lunch", convenience: "none" });
  explanationEl.textContent = "No explanation yet.";
  statusEl.textContent = "Preferences reset.";
});

loadLastBtn.addEventListener("click", () => {
  const lastPrefs = JSON.parse(localStorage.getItem("cafeteria_prefs") || "{}");
  const lastMeals = JSON.parse(localStorage.getItem("cafeteria_meals") || "[]");
  if (Object.keys(lastPrefs).length) {
    applyPrefs(lastPrefs);
  }
  if (lastMeals.length) {
    populateMeals(lastMeals[0].id);
    statusEl.textContent = "Loaded last recommendation set.";
  } else {
    statusEl.textContent = "No saved recommendations found.";
  }
});

const params = new URLSearchParams(window.location.search);
const preselect = params.get("mealId");
populateMeals(preselect);

const savedPrefs = localStorage.getItem("cafeteria_prefs");
if (savedPrefs) {
  applyPrefs(JSON.parse(savedPrefs));
}
