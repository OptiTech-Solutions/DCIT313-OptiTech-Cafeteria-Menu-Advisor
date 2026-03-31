const STORAGE_KEY = 'optitech_session'
const PREFS_KEY = 'optitech_prefs'

export function loadSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Failed to parse session', error)
    return null
  }
}

export function saveSession(session) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function savePreferences(prefs) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export function loadPreferences() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PREFS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Failed to parse preferences', error)
    return null
  }
}
