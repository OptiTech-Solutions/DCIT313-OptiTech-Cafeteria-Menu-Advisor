import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItemClass = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${
    isActive ? 'text-ink font-bold' : 'text-ink/60 hover:text-ink'
  }`

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="relative z-20">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white shadow-soft">
            <span className="text-lg font-bold">OA</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">OptiTech</p>
            <p className="text-base font-semibold text-ink">Cafeteria Menu Advisor</p>
          </div>
        </Link>

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

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1.5 text-xs font-medium text-leaf">
              <span className="h-2 w-2 rounded-full bg-leaf animate-pulse"></span>
              Prolog Engine Active
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4 md:hidden">
          <div className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-card">
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
    </div>
  )
}
