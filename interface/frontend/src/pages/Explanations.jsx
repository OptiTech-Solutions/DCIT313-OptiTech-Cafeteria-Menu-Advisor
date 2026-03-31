import { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import LoadingState from '../components/LoadingState'
import { FormField, SelectInput } from '../components/FormField'
import { useAuth } from '../hooks/useAuth.jsx'
import { getExplanation } from '../services/api'
import { MEAL_TIME_OPTIONS } from '../utils/options'
import { loadPreferences } from '../utils/storage'

function normalizeExplanation(data) {
  const payload =
    data?.explanations ||
    data?.rules ||
    data?.reasoning ||
    data?.explanation ||
    data?.trace ||
    data

  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (typeof payload === 'string') return [payload]
  if (typeof payload === 'object') return Object.values(payload)
  return [String(payload)]
}

export default function Explanations() {
  const { token } = useAuth()
  const [explanations, setExplanations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mealType, setMealType] = useState('all')

  const fetchExplanations = async (overrideMealType) => {
    setLoading(true)
    setError('')

    try {
      const prefs = loadPreferences()
      const selected = overrideMealType || mealType
      const payload =
        selected && selected !== 'all'
          ? { ...(prefs || {}), meal_type: selected }
          : prefs
      const data = await getExplanation(payload, token)
      setExplanations(normalizeExplanation(data))
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
        eyebrow="Explanations"
        title="Why the system recommends meals"
        description="Filter by meal type and see the rule-based reasoning behind each recommendation."
      />

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <FormField label="Meal type">
          <SelectInput
            name="meal_type"
            value={mealType}
            onChange={(value) => {
              setMealType(value)
              fetchExplanations(value)
            }}
            options={[{ value: 'all', label: 'All types' }, ...MEAL_TIME_OPTIONS]}
          />
        </FormField>
        <button
          type="button"
          onClick={() => fetchExplanations(mealType)}
          disabled={loading}
          className="h-11 rounded-full border border-ink/30 px-4 text-sm font-semibold text-ink/70 transition hover:border-ink/50 hover:text-ink"
        >
          Refresh explanations
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {loading && <LoadingState label="Fetching reasoning" />}
        {error && (
          <span className="rounded-full border border-berry/20 bg-berry/10 px-3 py-1 text-xs font-semibold text-berry">
            {error}
          </span>
        )}
      </div>

      <Card className="bg-white/90">
        {explanations.length === 0 && !loading ? (
          <p className="text-sm text-ink/60">
            No explanations returned yet. Generate a recommendation to see the reasoning steps.
          </p>
        ) : (
          <div className="space-y-3">
            {explanations.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm text-ink/70"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
