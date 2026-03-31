import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto w-full border-t border-ink/10 bg-[#6e5564] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">OptiTech</p>
            <p className="text-2xl font-semibold text-white">Cafeteria Menu Advisor</p>
            <p className="text-sm text-white/70">
              Smarter cafeteria choices, grounded in rule-based Prolog inference and clear explanations.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Resources</p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                to="/terms"
                className="rounded-full border border-white/20 px-4 py-2 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="rounded-full border border-white/20 px-4 py-2 text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/50 md:flex-row">
          <span>� {new Date().getFullYear()} OptiTech Solutions. All rights reserved.</span>
          <span> Expert Systems Project.</span>
        </div>
      </div>
    </footer>
  )
}
