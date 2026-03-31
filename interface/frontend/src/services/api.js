const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function buildUrl(path) {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`
  }
  return `${API_BASE_URL}${path}`
}

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {}

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = data?.error || data?.message || 'Request failed'
    throw new Error(message)
  }

  return data
}

export function login(payload) {
  return apiRequest('/login', { method: 'POST', body: payload })
}

export function register(payload) {
  return apiRequest('/register', { method: 'POST', body: payload })
}

export function getRecommendation(payload, token) {
  return apiRequest('/recommend', { method: 'POST', body: payload, token })
}

export function getWeeklyPlan(prefs, token) {
  if (prefs) {
    return apiRequest('/weekly-plan', { method: 'POST', body: prefs, token })
  }
  return apiRequest('/weekly-plan', { token })
}

export function getExplanation(prefs, token) {
  if (prefs) {
    return apiRequest('/explanation', { method: 'POST', body: prefs, token })
  }
  return apiRequest('/explanation', { token })
}

export function updateProfile(payload, token) {
  return apiRequest('/profile', { method: 'PUT', body: payload, token })
}
