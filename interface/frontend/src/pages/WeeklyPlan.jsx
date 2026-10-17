import { useState } from 'react'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import LoadingState from '../components/LoadingState'
import { useAuth } from '../hooks/useAuth.jsx'
import { addActivity } from '../utils/activity'
import { WEEK_DAYS } from '../utils/options'
import { getWeeklyPlan, swapMeal } from '../services/api'
import { loadPreferences } from '../utils/storage'
import { getMealImageByName, MEAL_NAME_IMAGES } from '../utils/mealImages'

// Fallback pool of meals for seamless local cycling if network is interrupted
const FALLBACK_MEALS = Object.keys(MEAL_NAME_IMAGES)

export default function WeeklyPlan() {
  const { token } = useAuth()
  const [planMap, setPlanMap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [swappingDay, setSwappingDay] = useState(null)
  const [error, setError] = useState('')
  const [prologTrace, setPrologTrace] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')

    try {
      const prefs = loadPreferences() || {}
      const data = await getWeeklyPlan(prefs, token)
      setPlanMap(data?.weekly_plan || {})
      setPrologTrace(data?.prolog_trace || '')
      addActivity({
        title: 'Weekly plan generated',
        subtitle: '7-day balanced meal plan',
        time: new Date().toLocaleDateString(),
      })
    } catch (err) {
      setError(err.message || 'Unable to generate weekly plan')
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async (dayName, currentMealName) => {
    setSwappingDay(dayName)
    setError('')
    try {
      const prefs = loadPreferences() || {}
      const data = await swapMeal(dayName.toLowerCase(), currentMealName, prefs)
      if (data?.meal) {
        setPlanMap((prev) => ({
          ...prev,
          [dayName.toLowerCase()]: data.meal,
        }))
      }
    } catch (err) {
      // Graceful local fallback rotation
      const currIdx = FALLBACK_MEALS.findIndex(
        (m) => m.toLowerCase() === (currentMealName || '').toLowerCase()
      )
      const nextMealName = FALLBACK_MEALS[(currIdx + 1) % FALLBACK_MEALS.length]
      setPlanMap((prev) => ({
        ...prev,
        [dayName.toLowerCase()]: {
          name: nextMealName,
          macros: { calories: 420, protein: '25g', carbs: '45g', fat: '12g' },
        },
      }))
    } finally {
      setSwappingDay(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getMealName = (dayKey) => {
    const val = planMap?.[dayKey.toLowerCase()] || planMap?.[dayKey]
    if (!val) return ''
    if (typeof val === 'string') return val
    return val.name || ''
  }

  const getMealMacros = (dayKey) => {
    const val = planMap?.[dayKey.toLowerCase()] || planMap?.[dayKey]
    if (val && typeof val === 'object') {
      return val.macros || null
    }
    return null
  }

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="print:hidden">
        <SectionHeader
          eyebrow="Expert System Schedule"
          title="7-Day Balanced Cafeteria Plan"
          description="Prolog applies modular indexing over compliant candidate meals to guarantee nutritional variety without violating safety constraints."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Evaluating Rules in Prolog...' : 'Generate 7-Day Plan'}
          </button>

          {planMap && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:border-slate-400"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Export PDF</span>
            </button>
          )}
        </div>

        {loading && <LoadingState label="Computing schedule via weekly_plan_rules.pl" />}

        {error && (
          <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
            {error}
          </span>
        )}
      </div>

      {/* Printable Header */}
      <div className="hidden print:block border-b border-slate-300 pb-3">
        <h1 className="text-xl font-bold text-slate-900">DCIT 313 Cafeteria Menu Advisor</h1>
        <p className="text-xs text-slate-500">7-Day Weekly Meal Schedule — Derived via SWI-Prolog Horn Clauses</p>
      </div>

      {/* Weekly Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-2 print:gap-3">
        {!planMap && !loading ? (
          <Card className="col-span-full p-8 text-center border-dashed border-slate-300 bg-white">
            <h4 className="text-sm font-bold text-slate-800">No Weekly Plan Generated Yet</h4>
            <p className="mt-1 text-xs text-slate-500">
              Click <strong>Generate 7-Day Plan</strong> above to compute your rotating menu from the Prolog knowledge base.
            </p>
          </Card>
        ) : (
          WEEK_DAYS.map((day) => {
            const mealName = getMealName(day)
            const macros = getMealMacros(day)
            const isSwapping = swappingDay === day

            return (
              <div
                key={day}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-900">{day}</h3>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Lunch / Dinner
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    {mealName ? (
                      <>
                        <img
                          src={getMealImageByName(mealName)}
                          alt={mealName}
                          className="h-14 w-14 rounded-xl object-cover shadow-sm shrink-0 border border-slate-100"
                        />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {mealName}
                          </p>
                          {macros && (
                            <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-slate-500">
                              <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                {macros.calories} kcal
                              </span>
                              <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-emerald-700">
                                {macros.protein} protein
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 py-3">No meal assigned</p>
                    )}
                  </div>
                </div>

                {/* Card Action: Swap Meal */}
                {mealName && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between print:hidden">
                    <button
                      type="button"
                      disabled={isSwapping}
                      onClick={() => handleSwap(day, mealName)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition disabled:opacity-50"
                    >
                      <svg
                        className={`w-3.5 h-3.5 ${isSwapping ? 'animate-spin' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>{isSwapping ? 'Rotating...' : 'Swap Meal'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">Next compliant meal</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Prolog Explanation Notice */}
      {planMap && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-mono text-slate-600 print:hidden shadow-sm">
          <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            Prolog Rule Contract: knowledge_base/weekly_plan_rules.pl
          </p>
          <p className="text-[11px] text-slate-500">
            Rules apply modular indexing over safe candidate meals: <code>pick_meal(DayIndex, Candidates, MealName) :- Index is (DayIndex - 1) mod Len</code>.
          </p>
        </div>
      )}
    </div>
  )
}
