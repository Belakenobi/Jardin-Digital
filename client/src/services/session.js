const SESSION_KEY = 'dg_session'

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession() {
  const storedSession = localStorage.getItem(SESSION_KEY)

  if (!storedSession) {
    return null
  }

  return JSON.parse(storedSession)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
