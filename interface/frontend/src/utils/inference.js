

export async function runInference(prefs) {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error || !data.meals) {
      throw new Error(data.error || 'No recommendations');
    }

    return {
      meals: data.meals.slice(0, 5),
      weeklyPlan: data.weekly_plan || {}
    };
  } catch (error) {
    console.error('Inference API failed:', error);
    return [];
  }
}
