import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Card from '../components/Card'
import SectionHeader from '../components/SectionHeader'
import { FormField, TextInput } from '../components/FormField'
import { useAuth } from '../hooks/useAuth.jsx'
import weeklyPlan from '../assets/weekly-plan.svg'

export default function Register() {
  const { signUp, authLoading, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await signUp(form)
    } catch (err) {
      setError(err.message || 'Unable to register')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Get started"
          title="Create your cafeteria profile"
          description="Sign up to store your preferences and unlock personalized recommendations."
        />
        <Card className="bg-white/90">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField label="Full name">
              <TextInput
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              />
            </FormField>
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
                placeholder="Create a secure password"
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
              {authLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-4 text-sm text-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-ink">
              Sign in
            </Link>
          </p>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-center gap-5 bg-white/80 text-center">
        <img src={weeklyPlan} alt="Weekly plan illustration" className="h-40 w-40" />
        <div>
          <h3 className="text-xl font-semibold text-ink">Save your weekly rhythm</h3>
          <p className="mt-2 text-sm text-ink/60">
            Build weekly plans and revisit your favorite meals anytime.
          </p>
        </div>
      </Card>
    </div>
  )
}
