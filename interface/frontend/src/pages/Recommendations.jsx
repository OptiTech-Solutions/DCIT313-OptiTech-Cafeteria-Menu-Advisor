import { useState } from 'react'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import LoadingState from '../components/LoadingState'
import { FormField, SelectInput } from '../components/FormField'
import { useAuth } from '../hooks/useAuth.jsx'
import { addActivity } from '../utils/activity'
import {
  CATEGORY_OPTIONS,
  GOAL_OPTIONS,
  HEALTH_OPTIONS,
  MEAL_TIME_OPTIONS,
  CONVENIENCE_OPTIONS,
  ALLERGY_OPTIONS,
} from '../utils/options'
import { getRecommendation } from '../services/api'
import { getMealImage, MEAL_IMAGE_POOL } from '../utils/mealImages'
import ShowcaseCard from '../components/ShowcaseCard'
import { savePreferences } from '../utils/storage'

const initialForm = {
  category: 'none',
  goal: 'balanced',
  health: 'none',
  meal_type: 'lunch',
  convenience: 'none',
  allergy: 'none',
}

function normalizeRecommendation(data) {
  const meals = Array.isArray(data?.meals) ? data.meals : []
  const explanation =
    data?.explanation || data?.reasoning || data?.reason || data?.details || data?.rule_trace

  return { meals, explanation, raw: data }
}

export default function Recommendations() {
  const { token } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [activeMeal, setActiveMeal] = useState(null)

  const handleChange = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await getRecommendation(form, token)
      const normalized = normalizeRecommendation(data)
      setResult(normalized)
      savePreferences(form)
      addActivity({
        title: 'Recommendation generated',
        subtitle: `${normalized.meals?.[0]?.name || 'Multiple meals'} \u2022 ${form.meal_type}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    } catch (err) {
      setError(err.message || 'Unable to fetch recommendation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Recommendations"
          title="Find your next cafeteria meal"
          description="Choose the preferences defined in the knowledge base so the inference engine can match you perfectly."
        />
        <Card className="bg-white/90">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField label="Category">
              <SelectInput
                name="category"
                value={form.category}
                onChange={handleChange('category')}
                options={CATEGORY_OPTIONS}
              />
            </FormField>
            <FormField label="Nutrition goal">
              <SelectInput
                name="goal"
                value={form.goal}
                onChange={handleChange('goal')}
                options={GOAL_OPTIONS}
              />
            </FormField>
            <FormField label="Health focus">
              <SelectInput
                name="health"
                value={form.health}
                onChange={handleChange('health')}
                options={HEALTH_OPTIONS}
              />
            </FormField>
            <FormField label="Meal time">
              <SelectInput
                name="meal_type"
                value={form.meal_type}
                onChange={handleChange('meal_type')}
                options={MEAL_TIME_OPTIONS}
              />
            </FormField>
            <FormField label="Convenience">
              <SelectInput
                name="convenience"
                value={form.convenience}
                onChange={handleChange('convenience')}
                options={CONVENIENCE_OPTIONS}
              />
            </FormField>
            <FormField label="Allergies">
              <SelectInput
                name="allergy"
                value={form.allergy}
                onChange={handleChange('allergy')}
                options={ALLERGY_OPTIONS}
              />
            </FormField>

            {error && (
              <div className="rounded-2xl border border-berry/20 bg-berry/10 px-4 py-3 text-sm text-berry">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-ink/60"
            >
              {loading ? 'Generating...' : 'Get Recommendation'}
            </button>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <ShowcaseCard
          eyebrow="Reasoning"
          title="Prolog-backed reasoning"
          description="We match your profile to the rule base and share the exact reasoning that fired."
          tone="calm"
          images={MEAL_IMAGE_POOL}
        />

        <Card className="bg-white/90">
          <h3 className="text-lg font-semibold text-ink">Your recommendation</h3>
          <p className="mt-2 text-sm text-ink/60">
            The advisor output will appear here after you submit the form.
          </p>

          <div className="mt-4 space-y-3">
            {loading && <LoadingState label="Calling Prolog engine" />}
            {result && !loading && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-ink/10 bg-mist px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Recommended meals</p>
                  {result.meals?.length ? (
                    <div className="mt-3 space-y-3">
                      {result.meals.map((meal) => (
                        <div
                          key={meal.id || meal.name}
                          className="flex gap-3 rounded-2xl border border-ink/10 bg-white p-3"
                        >
                          <img
                            src={getMealImage(meal)}
                            alt={meal.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-ink">{meal.name}</p>
                            {meal.reason && <p className="text-xs text-ink/60">{meal.reason}</p>}
                            {(meal.explanation || meal.reason) && (
                              <button
                                type="button"
                                onClick={() => setActiveMeal(meal)}
                                className="mt-2 text-xs font-semibold text-ink underline"
                              >
                                View explanation
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-ink/60">No meals returned.</p>
                  )}
                </div>
                {result.explanation && (
                  <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-ink/40">General explanation</p>
                    {Array.isArray(result.explanation) ? (
                      <ul className="mt-2 space-y-2 text-sm text-ink/70">
                        {result.explanation.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-ink/70">{result.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {!result && !loading && (
              <p className="text-sm text-ink/50">Submit the form to see recommendations.</p>
            )}
          </div>
        </Card>
      </div>

      {activeMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Explanation</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">{activeMeal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMeal(null)}
                className="text-sm font-semibold text-ink/60"
              >
                Close
              </button>
            </div>
            <div className="mt-4 whitespace-pre-line text-sm text-ink/70">
              {activeMeal.explanation || activeMeal.reason}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
