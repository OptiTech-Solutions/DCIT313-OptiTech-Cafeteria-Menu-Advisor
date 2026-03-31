import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import { FormField, TextInput } from '../components/FormField'
import { useAuth } from '../hooks/useAuth.jsx'
import mealBowl from '../assets/meal-bowl.svg'

export default function Login() {
  const { signIn, authLoading, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await signIn(form)
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Welcome back"
          title="Sign in to your dashboard"
          description="Access personalized meal recommendations, weekly plans, and rule-based explanations."
        />
        <Card className="bg-white/90">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField label="Email address">
              <TextInput
                type="email"
                name="email"
                placeholder="you@campus.edu"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              />
            </FormField>
            <FormField label="Password">
              <TextInput
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
              />
            </FormField>
            {error && (
              <div className="rounded-2xl border border-berry/20 bg-berry/10 px-4 py-3 text-sm text-berry">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-ink/60"
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-sm text-ink/60">
            New to the advisor?{' '}
            <Link to="/register" className="font-semibold text-ink">
              Create an account
            </Link>
          </p>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-center gap-5 bg-white/80 text-center">
        <img src={mealBowl} alt="Meal bowl illustration" className="h-40 w-40" />
        <div>
          <h3 className="text-xl font-semibold text-ink">Personalized cafeteria choices</h3>
          <p className="mt-2 text-sm text-ink/60">
            The expert system learns what you need and explains every meal recommendation.
          </p>
        </div>
      </Card>
    </div>
  )
}
