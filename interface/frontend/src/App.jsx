import { Routes, Route, Navigate } from 'react-router-dom'
import PageShell from './components/PageShell'
import Dashboard from './pages/Dashboard'
import Recommendations from './pages/Recommendations'
import WeeklyPlan from './pages/WeeklyPlan'
import Explanations from './pages/Explanations'
import Preferences from './pages/Preferences'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <PageShell>
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
    </PageShell>
  )
}
