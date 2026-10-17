import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItemClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
    isActive
      ? 'bg-slate-900 text-white shadow-sm'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  }`

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 print:hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition group-hover:scale-105">
            <span className="text-sm font-bold tracking-tight">OA</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                AI Expert System
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-tight">Cafeteria Advisor</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-1.5 md:flex bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
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
              Rule Trace
            </NavLink>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Prolog KB Connected
            </div>

            <button
              type="button"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle Navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden shadow-lg animate-fade-in">
          <nav className="flex flex-col gap-1 text-sm font-semibold">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/recommendations"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
              onClick={() => setMobileOpen(false)}
            >
              Recommendations
            </NavLink>
            <NavLink
              to="/weekly-plan"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
              onClick={() => setMobileOpen(false)}
            >
              Weekly Plan
            </NavLink>
            <NavLink
              to="/explanations"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
              onClick={() => setMobileOpen(false)}
            >
              Rule Trace (Explanations)
            </NavLink>
          </nav>
        </div>
      )}
    </div>
  )
}
