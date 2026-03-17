import { MEAL_DB } from '../data/meals';

export function runInference(prefs) {
  const { category, goal, health, meal_type, convenience } = prefs;
  const results = [];

  const match = (id, reason) => {
    const m = MEAL_DB[id];
    if (!m) return;
    // Safety guard: vegetarians never get meat meals
    if (category === 'veg' && m.cat === 'non_veg') return;
    if (!results.find(r => r.id === id))
      results.push({ id, name: m.name, reason, ...m });
  };

  // ── Priority 1: Gym rules ──────────────────────────────────────
  if (category === 'gym') {
    if (goal === 'high_protein')
      ['m2','m12','m1','m13','m3'].forEach(id => match(id, 'Gym: high protein meal'));
    if (health === 'wg')
      ['m2','m7','m12','m13'].forEach(id => match(id, 'Gym: weight gain meal'));
    if (health === 'wl' && goal === 'low_carb')
      ['m6','m15'].forEach(id => match(id, 'Gym: weight loss low carb'));
    if (meal_type === 'breakfast')
      ['m5','m9','m11'].forEach(id => match(id, 'Gym: breakfast meal'));
  }

  // ── Priority 2: Vegetarian rules ──────────────────────────────
  if (category === 'veg') {
    if (goal === 'high_protein')
      ['m1','m3','m13','m9','m14'].forEach(id => match(id, 'Vegetarian: high protein meal'));
    if (goal === 'balanced')
      ['m7','m5','m11'].forEach(id => match(id, 'Vegetarian: balanced meal'));
    if (meal_type === 'dinner')
      ['m3'].forEach(id => match(id, 'Vegetarian: dinner option'));
  }

  // ── Priority 2: Non-vegetarian rules ──────────────────────────
  if (category === 'non_veg') {
    if (goal === 'high_protein')
      ['m2','m12'].forEach(id => match(id, 'Non-veg: high protein meal'));
    if (goal === 'low_carb')
      ['m6','m15'].forEach(id => match(id, 'Non-veg: low carb meal'));
  }

  // ── Priority 3: Health rules ───────────────────────────────────
  if (health === 'wl' && goal === 'low_carb')
    ['m6','m15'].forEach(id => match(id, 'Health: weight loss low carb'));
  if (health === 'wg' && goal === 'high_protein')
    ['m2','m12'].forEach(id => match(id, 'Health: weight gain high protein'));
  if (goal === 'balanced')
    ['m5','m7','m11','m10','m4'].forEach(id => match(id, 'General: balanced diet meal'));

  // ── Priority 4: Convenience ───────────────────────────────────
  if (convenience === 'quick')
    ['m8','m14'].forEach(id => match(id, 'Convenience: quick meal'));

  // ── Fallback ──────────────────────────────────────────────────
  if (results.length === 0)
    ['m5','m13','m10'].forEach(id => match(id, 'General: balanced diet meal'));

  return results.slice(0, 5);
}
