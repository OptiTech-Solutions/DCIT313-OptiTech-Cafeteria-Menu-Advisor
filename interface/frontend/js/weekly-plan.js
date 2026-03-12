const planForm = document.getElementById("plan-form");
const statusEl = document.getElementById("status");
const planList = document.getElementById("plan-list");
const resetBtn = document.getElementById("reset");
const downloadBtn = document.getElementById("download-plan");

CafeteriaAPI.loadLayout();

let latestPlan = null;

function readPrefs() {
  return {
    category: planForm.category.value,
    goal: planForm.goal.value,
    health: planForm.health.value,
    meal_type: planForm.meal_type.value,
    convenience: planForm.convenience.value
  };
}

function applyPrefs(prefs) {
  planForm.category.value = prefs.category || "gym";
  planForm.goal.value = prefs.goal || "balanced";
  planForm.health.value = prefs.health || "none";
  planForm.meal_type.value = prefs.meal_type || "lunch";
  planForm.convenience.value = prefs.convenience || "none";
}

function renderPlan(plan) {
  planList.innerHTML = "";
  if (!plan || Object.keys(plan).length === 0) {
    planList.innerHTML = `<div class="empty">No plan yet.</div>`;
    return;
  }
  Object.entries(plan).forEach(([day, meal]) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<span>${day.toUpperCase()}</span><strong>${meal}</strong>`;
    planList.appendChild(item);
  });
}

planForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "Generating weekly plan...";
  const prefs = readPrefs();
  const data = await CafeteriaAPI.getWeeklyPlan(prefs);
  latestPlan = data.weekly_plan || {};
  renderPlan(latestPlan);
  localStorage.setItem("cafeteria_plan", JSON.stringify(latestPlan));
  localStorage.setItem("cafeteria_prefs", JSON.stringify(prefs));
  statusEl.textContent = Object.keys(latestPlan).length ? "Weekly plan ready." : "No plan generated.";
});

resetBtn.addEventListener("click", () => {
  applyPrefs({ category: "gym", goal: "balanced", health: "none", meal_type: "lunch", convenience: "none" });
  planList.innerHTML = "";
  statusEl.textContent = "Preferences reset.";
});

downloadBtn.addEventListener("click", () => {
  const plan = latestPlan || JSON.parse(localStorage.getItem("cafeteria_plan") || "{}");
  if (!plan || Object.keys(plan).length === 0) {
    statusEl.textContent = "Generate a plan before downloading.";
    return;
  }
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "weekly-plan.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  statusEl.textContent = "Plan downloaded.";
});

const savedPrefs = localStorage.getItem("cafeteria_prefs");
if (savedPrefs) {
  applyPrefs(JSON.parse(savedPrefs));
}

const savedPlan = localStorage.getItem("cafeteria_plan");
if (savedPlan) {
  latestPlan = JSON.parse(savedPlan);
  renderPlan(latestPlan);
}
