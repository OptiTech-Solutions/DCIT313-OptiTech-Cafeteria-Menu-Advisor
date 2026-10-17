import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PageShell from './components/PageShell'

// Lazy loading all page chunks for optimal performance & code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const WeeklyPlan = lazy(() => import('./pages/WeeklyPlan'))
const Explanations = lazy(() => import('./pages/Explanations'))
const Preferences = lazy(() => import('./pages/Preferences'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-pulse py-8">
      <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
      <div className="h-4 w-96 bg-slate-200/60 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="h-48 bg-slate-200/50 rounded-2xl"></div>
        <div className="h-48 bg-slate-200/50 rounded-2xl"></div>
        <div className="h-48 bg-slate-200/50 rounded-2xl"></div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <PageShell>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/weekly-plan" element={<WeeklyPlan />} />
          <Route path="/explanations" element={<Explanations />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Navigate to="/" replace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageShell>
  )
}
