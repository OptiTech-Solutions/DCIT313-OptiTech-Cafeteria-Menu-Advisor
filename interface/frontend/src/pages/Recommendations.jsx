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
import { savePreferences, loadPreferences } from '../utils/storage'

const initialForm = {
  category: 'none',
  goal: 'balanced',
  health: 'none',
  meal_type: 'lunch',
  convenience: 'none',
  allergy: 'none',
}

export default function Recommendations() {
  const { token } = useAuth()
  const [form, setForm] = useState(() => {
    const saved = loadPreferences()
    return saved ? { ...initialForm, ...saved } : initialForm
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [activeMeal, setActiveMeal] = useState(null)
  const [showPrologTrace, setShowPrologTrace] = useState(false)
  const [showWhyNot, setShowWhyNot] = useState(false)

  const handleChange = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await getRecommendation(form, token)
      setResult(data)
      savePreferences(form)
      addActivity({
        type: 'recommendation',
        title: `Recommendation for ${form.category !== 'none' ? form.category : 'General'}`,
        description: `Goal: ${form.goal} • Meal: ${form.meal_type}`,
        payload: form,
      })
    } catch (err) {
      setError(err.message || 'Unable to load recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Expert System Advisor"
        title="Prolog Meal Recommendations"
        description="Configure your student profile. Our SWI-Prolog forward-chaining rules evaluate Horn clauses by priority and enforce strict safety guards."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        {/* Left Column: Input Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dietary Profile</h3>
              <p className="text-xs text-slate-500">Asserted as dynamic facts in working memory</p>
            </div>
            <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
              Prolog KB
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <FormField label="Student Category">
              <SelectInput
                name="category"
                value={form.category}
                onChange={handleChange('category')}
                options={CATEGORY_OPTIONS}
              />
            </FormField>

            <FormField label="Nutritional Goal">
              <SelectInput
                name="goal"
                value={form.goal}
                onChange={handleChange('goal')}
                options={GOAL_OPTIONS}
              />
            </FormField>

            <FormField label="Health Objective">
              <SelectInput
                name="health"
                value={form.health}
                onChange={handleChange('health')}
                options={HEALTH_OPTIONS}
              />
            </FormField>

            <FormField label="Meal Time Preference">
              <SelectInput
                name="meal_type"
                value={form.meal_type}
                onChange={handleChange('meal_type')}
                options={MEAL_TIME_OPTIONS}
              />
            </FormField>

            <FormField label="Convenience Requirement">
              <SelectInput
                name="convenience"
                value={form.convenience}
                onChange={handleChange('convenience')}
                options={CONVENIENCE_OPTIONS}
              />
            </FormField>

            <FormField label="Allergies / Dietary Restrictions">
              <SelectInput
                name="allergy"
                value={form.allergy}
                onChange={handleChange('allergy')}
                options={ALLERGY_OPTIONS}
              />
            </FormField>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Evaluating Rules in Prolog...' : 'Run Prolog Advisor'}
            </button>
          </form>
        </div>

        {/* Right Column: Output Recommendations */}
        <div className="space-y-6">
          <ShowcaseCard
            eyebrow="Inference Engine"
            title="Production Rule Reasoning"
            description="Every recommendation is verified by Prolog Horn clauses, ranking candidate meals and guaranteeing vegetarian and allergy safety."
            tone="calm"
            images={MEAL_IMAGE_POOL}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Advisor Results</h3>
                <p className="text-xs text-slate-500">
                  {result?.meals?.length ? `${result.meals.length} matching safe recommendations found` : 'Awaiting profile submission'}
                </p>
              </div>

              {result && (
                <button
                  type="button"
                  onClick={() => setShowPrologTrace((v) => !v)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  {showPrologTrace ? 'Hide Query' : 'View Query'}
                </button>
              )}
            </div>

            {/* Collapsible Prolog Query Trace */}
            {result && showPrologTrace && (
              <div className="mt-4 rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-200 overflow-x-auto shadow-inner border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-amber-400 font-bold text-xs">SWI-Prolog Evaluation Goal</span>
                  <span className="text-slate-500 text-[10px]">knowledge_base/cafeteria_kb.pl</span>
                </div>
                <pre className="whitespace-pre text-[11px] leading-relaxed text-slate-300">{result.prolog_trace}</pre>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {loading && <LoadingState label="Asserting facts and querying Prolog engine..." />}

              {result && !loading && (
                <div className="space-y-4">
                  {result.meals?.length ? (
                    <div className="space-y-3">
                      {result.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                        >
                          <img
                            src={getMealImage(meal)}
                            alt={meal.name}
                            className="h-16 w-16 rounded-xl object-cover self-center sm:self-start shadow-sm border border-slate-100"
                          />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{meal.name}</h4>
                              <div className="flex items-center gap-1.5">
                                {meal.match_score && (
                                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    {meal.match_score}% Match
                                  </span>
                                )}
                                {meal.rule_code && (
                                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                                    Rule [{meal.rule_code}]
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              {meal.reason}
                            </p>

                            {/* Macro Badges */}
                            {meal.macros && (
                              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-semibold text-slate-600">
                                <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">
                                  🔥 {meal.macros.calories} kcal
                                </span>
                                <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200 text-emerald-700">
                                  🥩 {meal.macros.protein} protein
                                </span>
                                <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200 text-amber-700">
                                  🍚 {meal.macros.carbs} carbs
                                </span>
                                <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">
                                  🥑 {meal.macros.fat} fat
                                </span>
                              </div>
                            )}

                            <div className="pt-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveMeal(meal)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Inspect Rule Trace</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                      <p className="text-xs text-slate-500">No meals matched all criteria. Try adjusting constraints.</p>
                    </div>
                  )}

                  {/* Why Not Excluded Meals Drawer */}
                  {result.why_not && result.why_not.length > 0 && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                      <button
                        type="button"
                        onClick={() => setShowWhyNot((v) => !v)}
                        className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-700"
                      >
                        <span>Why Were Other Meals Excluded? ({result.why_not.length})</span>
                        <span className="text-slate-400">{showWhyNot ? '▲' : '▼'}</span>
                      </button>

                      {showWhyNot && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          {result.why_not.map((item, idx) => {
                            const name = typeof item === 'object' && item?.name ? item.name : 'Meal'
                            const explanation =
                              typeof item === 'object' && item?.explanation
                                ? item.explanation
                                : typeof item === 'string'
                                ? item
                                : 'Excluded by constraints'
                            const isSafety = typeof item === 'object' && item?.status === 'safety_violation'

                            return (
                              <div
                                key={idx}
                                className={`rounded-lg p-2.5 text-xs flex items-start gap-2 ${
                                  isSafety
                                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                    : 'bg-slate-50 text-slate-700 border border-slate-100'
                                }`}
                              >
                                <span className="font-bold shrink-0">✕</span>
                                <div>
                                  <strong className="font-semibold">{name}</strong>: {explanation}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!result && !loading && (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
                  <p className="text-xs font-medium text-slate-500">
                    Select your preferences on the left and click <strong>Run Prolog Advisor</strong> to execute the expert system.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Explanation Modal */}
      {activeMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-in border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Prolog Rule Trace
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{activeMeal.name}</h3>
                <p className="text-[11px] text-slate-500">Forward Chaining Horn Clause Evaluation</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMeal(null)}
                className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-200 space-y-1 whitespace-pre-line border border-slate-800 leading-relaxed">
                {activeMeal.explanation}
              </div>

              {activeMeal.macros && (
                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">Calories</p>
                    <p className="text-xs font-bold text-slate-900">{activeMeal.macros.calories}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">Protein</p>
                    <p className="text-xs font-bold text-slate-900">{activeMeal.macros.protein}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">Carbs</p>
                    <p className="text-xs font-bold text-slate-900">{activeMeal.macros.carbs}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <p className="text-[10px] text-slate-400 font-semibold">Fat</p>
                    <p className="text-xs font-bold text-slate-900">{activeMeal.macros.fat}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveMeal(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
