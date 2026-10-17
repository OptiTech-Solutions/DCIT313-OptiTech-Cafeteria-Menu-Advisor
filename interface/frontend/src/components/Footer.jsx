import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto w-full border-t border-slate-200/80 bg-white text-slate-600 print:hidden">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
              OA
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Cafeteria Menu Advisor</p>
              <p className="text-xs text-slate-500">DCIT 313 AI Expert System — Powered by SWI-Prolog</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <Link to="/recommendations" className="hover:text-slate-900 transition">Recommendations</Link>
            <Link to="/weekly-plan" className="hover:text-slate-900 transition">Weekly Plan</Link>
            <Link to="/explanations" className="hover:text-slate-900 transition">Explanations</Link>
            <Link to="/terms" className="hover:text-slate-900 transition">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-900 transition">Privacy</Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} OptiTech Solutions. All rights reserved.</span>
          <span>Knowledge Engineering & Rule-Based Inference Project</span>
        </div>
      </div>
    </footer>
  )
}
