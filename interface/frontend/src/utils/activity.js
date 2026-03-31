const ACTIVITY_KEY = 'optitech_activity'

export function loadActivity() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('Failed to parse activity', error)
    return []
  }
}

export function addActivity(entry) {
  if (typeof window === 'undefined') return
  const current = loadActivity()
  const updated = [entry, ...current].slice(0, 5)
  window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated))
}
