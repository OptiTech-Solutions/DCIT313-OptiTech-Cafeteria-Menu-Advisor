import { createContext, useContext, useMemo, useState } from 'react'
import { login as apiLogin, register as apiRegister, updateProfile as apiUpdateProfile } from '../services/api'
import { loadSession, saveSession, clearSession } from '../utils/storage'

const AuthContext = createContext(null)

function normalizeSession(data, fallback = {}) {
  const token =
    data?.token ||
    data?.access_token ||
    data?.auth?.token ||
    data?.session?.token ||
    data?.jwt ||
    'session-token'

  const userData = data?.user || data?.profile || {}
  const name =
    userData?.name ||
    data?.name ||
    fallback?.name ||
    fallback?.email?.split('@')[0] ||
    'Guest'
  const email = userData?.email || data?.email || fallback?.email || ''

  return {
    token,
    user: { name, email },
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())
  const [authLoading, setAuthLoading] = useState(false)

  const signIn = async (credentials) => {
    setAuthLoading(true)
    try {
      const data = await apiLogin(credentials)
      const normalized = normalizeSession(data, credentials)
      setSession(normalized)
      saveSession(normalized)
      return normalized
    } finally {
      setAuthLoading(false)
    }
  }

  const signUp = async (payload) => {
    setAuthLoading(true)
    try {
      const data = await apiRegister(payload)
      const normalized = normalizeSession(data, payload)
      setSession(normalized)
      saveSession(normalized)
      return normalized
    } finally {
      setAuthLoading(false)
    }
  }

  const signOut = () => {
    setSession(null)
    clearSession()
  }

  const updateProfile = async (payload) => {
    setAuthLoading(true)
    try {
      const data = await apiUpdateProfile(payload, session?.token)
      const normalized = normalizeSession(data, payload)
      setSession(normalized)
      saveSession(normalized)
      return normalized
    } finally {
      setAuthLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token),
      signIn,
      signUp,
      signOut,
      updateProfile,
      authLoading,
    }),
    [session, authLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
