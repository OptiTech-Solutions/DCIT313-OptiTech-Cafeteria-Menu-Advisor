import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageShell from './components/PageShell'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Recommendations from './pages/Recommendations'
import WeeklyPlan from './pages/WeeklyPlan'
import Explanations from './pages/Explanations'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Preferences from './pages/Preferences'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import LaunchScreen from './components/LaunchScreen'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase('exit'), 3200)
    const removeTimer = setTimeout(() => setShowSplash(false), 3800)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  return (
    <>
      {showSplash && <LaunchScreen phase={phase} />}
      <PageShell>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-plan"
            element={
              <ProtectedRoute>
                <WeeklyPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explanations"
            element={
              <ProtectedRoute>
                <Explanations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <Preferences />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageShell>
    </>
  )
}
