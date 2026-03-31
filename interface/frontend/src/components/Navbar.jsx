import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const navItemClass = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${
    isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'
  }`

export default function Navbar() {
  const { user, isAuthenticated, signOut, updateProfile, authLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [formError, setFormError] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return

    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (editOpen) {
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirm: '',
      })
      setFormError('')
    }
  }, [editOpen, user])

  return (
    <div className="relative z-20">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-8">
        <Link to={isAuthenticated ? '/' : '/login'} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white shadow-soft">
            <span className="text-lg font-bold">OA</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">OptiTech</p>
            <p className="text-base font-semibold text-ink">Cafeteria Advisor</p>
          </div>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 md:gap-6">
            <nav className="hidden items-center gap-6 md:flex">
              <NavLink to="/" className={navItemClass}>
                Dashboard
              </NavLink>
              <NavLink to="/recommendations" className={navItemClass}>
                Recommendations
              </NavLink>
              <NavLink to="/weekly-plan" className={navItemClass}>
                Weekly Plan
              </NavLink>
              <NavLink to="/explanations" className={navItemClass}>
                Explanations
              </NavLink>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden rounded-full border border-ink/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60"
                onClick={() => setMobileOpen((open) => !open)}
              >
                Menu
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-card transition hover:-translate-y-0.5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                    {user?.name?.trim()?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden text-sm font-semibold text-ink md:block">
                    Welcome, {user?.name?.split(' ')[0] || 'Guest'}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/70 bg-white/90 p-2 shadow-soft">
                    <div className="px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Signed in</p>
                      <p className="text-sm font-semibold text-ink">
                        {user?.name || 'Guest'}
                      </p>
                      <p className="text-xs text-ink/50">{user?.email || 'No email'}</p>
                    </div>
                    <div className="my-2 h-px bg-ink/10" />
                    <Link
                      to="/profile"
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/preferences"
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                    >
                      Preferences
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setEditOpen(true)
                      }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={signOut}
                      className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-berry transition hover:bg-berry/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-ink/40 hover:text-ink"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        )}
      </header>

      {isAuthenticated && mobileOpen && (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4 md:hidden">
          <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-card">
            <nav className="flex flex-col gap-3 text-sm font-semibold text-ink/70">
              <NavLink to="/" className={navItemClass} onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink
                to="/recommendations"
                className={navItemClass}
                onClick={() => setMobileOpen(false)}
              >
                Recommendations
              </NavLink>
              <NavLink
                to="/weekly-plan"
                className={navItemClass}
                onClick={() => setMobileOpen(false)}
              >
                Weekly Plan
              </NavLink>
              <NavLink
                to="/explanations"
                className={navItemClass}
                onClick={() => setMobileOpen(false)}
              >
                Explanations
              </NavLink>
            </nav>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Profile</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">Edit credentials</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="text-sm font-semibold text-ink/60"
              >
                Close
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault()
                setFormError('')
                if (!form.name.trim() || !form.email.trim()) {
                  setFormError('Name and email are required.')
                  return
                }
                if (form.password && form.password !== form.confirm) {
                  setFormError('Passwords do not match.')
                  return
                }

                try {
                  await updateProfile({
                    current_email: user?.email,
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password.trim(),
                  })
                  setEditOpen(false)
                } catch (err) {
                  setFormError(err.message || 'Unable to update profile.')
                }
              }}
            >
              <label className="flex flex-col gap-2 text-sm text-ink/70">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
                  Full name
                </span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-ink/40"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-ink/70">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
                  Email address
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-ink/40"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-ink/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
                    New password
                  </span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-ink/40"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-ink/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(event) => setForm((prev) => ({ ...prev, confirm: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-ink/40"
                  />
                </label>
              </div>

              {formError && (
                <div className="rounded-2xl border border-berry/20 bg-berry/10 px-4 py-3 text-sm text-berry">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-ink/40 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-ink/60"
                >
                  {authLoading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
