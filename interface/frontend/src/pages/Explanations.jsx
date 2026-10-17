import { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import LoadingState from '../components/LoadingState'
import { FormField, SelectInput } from '../components/FormField'
import { useAuth } from '../hooks/useAuth.jsx'
import { getExplanation } from '../services/api'
import { MEAL_TIME_OPTIONS } from '../utils/options'
import { loadPreferences } from '../utils/storage'

export default function Explanations() {
  const { token } = useAuth()
  const [explanations, setExplanations] = useState([])
  const [whyNot, setWhyNot] = useState([])
  const [prologTrace, setPrologTrace] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mealType, setMealType] = useState('all')

  const fetchExplanations = async (overrideMealType) => {
    setLoading(true)
    setError('')

    try {
      const prefs = loadPreferences() || {}
      const selected = overrideMealType || mealType
      const payload =
        selected && selected !== 'all'
          ? { ...prefs, meal_type: selected }
          : prefs
      const data = await getExplanation(payload, token)
      setExplanations(data?.explanations || [])
      setWhyNot(data?.why_not || [])
      setPrologTrace(data?.prolog_trace || '')
    } catch (err) {
      setError(err.message || 'Unable to fetch explanations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExplanations('all')
  }, [])

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Expert System Explanation Facility"
        title="Prolog Rule Reasoning & Trace"
        description="A defining attribute of an AI Expert System is transparency. Here is the formal forward-chaining rule trace proving why meals were approved or excluded."
      />

      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 min-w-[240px]">
          <FormField label="Filter by Meal Type">
            <SelectInput
              name="meal_type"
              value={mealType}
              onChange={(value) => {
                setMealType(value)
                fetchExplanations(value)
              }}
              options={[{ value: 'all', label: 'All types (Breakfast, Lunch, Dinner, Snack)' }, ...MEAL_TIME_OPTIONS]}
            />
          </FormField>
        </div>
        <button
          type="button"
          onClick={() => fetchExplanations(mealType)}
          disabled={loading}
          className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Consulting KB...' : 'Refresh Explanations'}
        </button>
      </div>

      {loading && <LoadingState label="Running explain_recommendation/2 queries..." />}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* SWI-Prolog Query Trace Card */}
      {prologTrace && (
        <div className="rounded-2xl bg-slate-900 p-5 text-xs font-mono text-slate-200 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wide">
                Prolog Predicates (knowledge_base/explanation.pl)
              </span>
            </div>
            <span className="text-slate-400 text-[10px]">explain_recommendation/2 &amp; why_not/2</span>
          </div>
          <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-slate-300">
            {prologTrace}
          </pre>
        </div>
      )}

      {/* Recommended Meals Explanation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900">Why Were These Meals Recommended?</h3>
          <p className="text-xs text-slate-500">Horn clauses that satisfied conditions and passed safety constraints</p>
        </div>

        {explanations.length === 0 && !loading ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No explanations generated yet. Run a recommendation first.
          </p>
        ) : (
          <div className="space-y-3">
            {explanations.map((item, index) => {
              const text = typeof item === 'string' ? item : JSON.stringify(item)
              return (
                <div
                  key={index}
                  className="rounded-xl border-l-4 border-l-emerald-500 border border-slate-100 bg-slate-50/70 p-4 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed shadow-sm"
                >
                  {text}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Excluded Meals Why-Not Analysis */}
      {whyNot.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Why Were Other Meals Excluded? (why_not/2)</h3>
            <p className="text-xs text-slate-500">Traced safety guard violations and rule preference mismatches</p>
          </div>

          <div className="space-y-2">
            {whyNot.map((item, index) => {
              const name = typeof item === 'object' && item?.name ? item.name : 'Meal'
              const explanation =
                typeof item === 'object' && item?.explanation
                  ? item.explanation
                  : typeof item === 'string'
                  ? item
                  : 'Excluded by preference constraints'

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 flex items-start gap-2.5"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-[10px]">
                    ✕
                  </span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-900 font-semibold">{name}</strong>: {explanation}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
