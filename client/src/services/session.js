const SESSION_KEY = 'dg_session'

export function saveSession(session) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session),
  )
}

export function getSession() {
  const storedSession =
    localStorage.getItem(SESSION_KEY)

  if (!storedSession) {
    return null
  }

  try {
    const session = JSON.parse(storedSession)

    if (
      !session ||
      typeof session !== 'object'
    ) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
