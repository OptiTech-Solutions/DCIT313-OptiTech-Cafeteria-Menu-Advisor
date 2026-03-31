import { useMemo, useState } from 'react'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import LoadingState from '../components/LoadingState'
import { useAuth } from '../hooks/useAuth.jsx'
import { addActivity } from '../utils/activity'
import { WEEK_DAYS } from '../utils/options'
import { getWeeklyPlan } from '../services/api'
import { loadPreferences } from '../utils/storage'
import { getMealImageByName } from '../utils/mealImages'

function normalizeMeals(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  if (typeof value === 'object') {
    if (value.name) return [value.name]
    if (value.meal) return [value.meal]
    if (value.items) return value.items
  }
  return [String(value)]
}

function normalizePlan(data) {
  const payload = data?.weekly_plan || data?.weeklyPlan || data?.plan || data

  if (Array.isArray(payload)) {
    return WEEK_DAYS.map((day, index) => {
      const match = payload.find(
        (item) =>
          item?.day?.toLowerCase() === day.toLowerCase() ||
          item?.day === day ||
          item?.day_index === index
      )
      return {
        day,
        meals: normalizeMeals(match?.meals || match?.meal || match),
      }
    })
  }

  if (payload && typeof payload === 'object') {
    return WEEK_DAYS.map((day) => {
      const value =
        payload[day] ||
        payload[day.toLowerCase()] ||
        payload[day.slice(0, 3).toLowerCase()]
      return { day, meals: normalizeMeals(value) }
    })
  }

  return WEEK_DAYS.map((day) => ({ day, meals: [] }))
}

export default function WeeklyPlan() {
  const { token } = useAuth()
  const [planData, setPlanData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plan = useMemo(() => (planData ? normalizePlan(planData) : []), [planData])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')

    try {
      const prefs = loadPreferences()
      const data = await getWeeklyPlan(prefs, token)
      setPlanData(data)
      addActivity({
        title: 'Weekly plan generated',
        subtitle: '7-day cafeteria plan',
        time: new Date().toLocaleDateString(),
      })
    } catch (err) {
      setError(err.message || 'Unable to generate weekly plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Weekly Plan"
        title="Plan your cafeteria week"
        description="Generate a 7-day menu that keeps your nutrition goals on track while keeping variety." 
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-ink/60"
        >
          {loading ? 'Generating plan...' : 'Generate Plan'}
        </button>
        {loading && <LoadingState label="Building weekly plan" />}
        {error && (
          <span className="rounded-full border border-berry/20 bg-berry/10 px-3 py-1 text-xs font-semibold text-berry">
            {error}
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan.length === 0 && !loading ? (
          <Card className="col-span-full bg-white/80">
            <p className="text-sm text-ink/60">
              No plan generated yet. Click the button above to create your cafeteria schedule.
            </p>
          </Card>
        ) : (
          plan.map((day) => (
            <Card key={day.day} className="bg-white/90">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">{day.day}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-ink/40">Meals</span>
              </div>
              <div className="mt-4 space-y-2">
                {day.meals.length === 0 ? (
                  <p className="text-sm text-ink/50">No meals returned</p>
                ) : (
                  day.meals.map((meal, index) => (
                    <div
                      key={`${meal}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-mist px-3 py-2"
                    >
                      <img
                        src={getMealImageByName(meal)}
                        alt={meal}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <span className="text-sm text-ink/70">{meal}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
