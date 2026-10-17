import { useState, useEffect } from 'react'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import { FormField, SelectInput } from '../components/FormField'
import {
  CATEGORY_OPTIONS,
  GOAL_OPTIONS,
  HEALTH_OPTIONS,
  MEAL_TIME_OPTIONS,
  CONVENIENCE_OPTIONS,
  ALLERGY_OPTIONS,
} from '../utils/options'
import { loadPreferences, savePreferences } from '../utils/storage'

const defaultPreferences = {
  category: 'none',
  goal: 'balanced',
  health: 'none',
  meal_type: 'lunch',
  convenience: 'none',
  allergy: 'none',
}

export default function Preferences() {
  const [prefs, setPrefs] = useState(defaultPreferences)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    const existing = loadPreferences()
    if (existing) {
      setPrefs({ ...defaultPreferences, ...existing })
    }
  }, [])

  const handleChange = (key) => (value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
    setSavedMessage('')
  }

  const handleSave = (e) => {
    e.preventDefault()
    savePreferences(prefs)
    setSavedMessage('Default preferences saved! Your recommendations will now automatically load with these settings.')
    setTimeout(() => setSavedMessage(''), 4500)
  }

  const handleReset = () => {
    setPrefs(defaultPreferences)
    savePreferences(defaultPreferences)
    setSavedMessage('Preferences reset to default values.')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Profile Settings"
        title="Personal Dietary Preferences"
        description="Configure your default dietary profile. These values will automatically pre-populate your recommendations and weekly plans."
      />

      {savedMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 animate-fadeIn">
          <svg className="h-5 w-5 flex-shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-slate-200/80 bg-white/95">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Primary Goal">
                <SelectInput
                  name="goal"
                  value={prefs.goal}
                  onChange={handleChange('goal')}
                  options={GOAL_OPTIONS}
                />
              </FormField>
              <FormField label="Dietary Category">
                <SelectInput
                  name="category"
                  value={prefs.category}
                  onChange={handleChange('category')}
                  options={CATEGORY_OPTIONS}
                />
              </FormField>
              <FormField label="Health Objective">
                <SelectInput
                  name="health"
                  value={prefs.health}
                  onChange={handleChange('health')}
                  options={HEALTH_OPTIONS}
                />
              </FormField>
              <FormField label="Typical Meal Time">
                <SelectInput
                  name="meal_type"
                  value={prefs.meal_type}
                  onChange={handleChange('meal_type')}
                  options={MEAL_TIME_OPTIONS}
                />
              </FormField>
              <FormField label="Allergies & Restrictions">
                <SelectInput
                  name="allergy"
                  value={prefs.allergy}
                  onChange={handleChange('allergy')}
                  options={ALLERGY_OPTIONS}
                />
              </FormField>
              <FormField label="Convenience Requirement">
                <SelectInput
                  name="convenience"
                  value={prefs.convenience}
                  onChange={handleChange('convenience')}
                  options={CONVENIENCE_OPTIONS}
                />
              </FormField>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Preferences</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Reset Defaults
              </button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-slate-900">How Preferences Work</h3>
            </div>
            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500"></span>
                <span>Preferences are securely stored in your local browser session and synchronized with inference queries.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500"></span>
                <span>Whenever you open <strong>Get Recommendations</strong>, your form will load pre-filled with these defaults.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500"></span>
                <span>Any allergies selected here trigger strict <strong>safety_guard</strong> pruning in the Prolog rule engine.</span>
              </li>
            </ul>
          </Card>

          <Card className="border-indigo-100 bg-indigo-50/50">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-indigo-950">Safety Enforcement</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-indigo-900/80">
              Meals violating your allergy restrictions are evaluated as <code className="rounded bg-indigo-100 px-1 py-0.5 text-indigo-800 font-mono">unsafe/1</code> and pruned by Horn clause safety guards prior to ranking.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
