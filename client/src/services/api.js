import {
  clearSession,
  getSession,
  saveSession,
} from './session.js'

const API_URL = import.meta.env.VITE_API_URL

let refreshPromise = null

function redirectToLogin() {
  clearSession()

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

async function refreshAccessToken() {
  const session = getSession()

  if (!session?.refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(
    `${API_URL}/auth/refresh`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: session.refreshToken,
      }),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Session could not be refreshed',
    )
  }

  const newSession = data.data?.session

  if (
    !newSession?.accessToken ||
    !newSession?.refreshToken
  ) {
    throw new Error(
      'Invalid refreshed session',
    )
  }

  saveSession(newSession)

  return newSession
}

async function getRefreshedSession() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

async function sendRequest(
  endpoint,
  options,
  accessToken,
) {
  const isFormData =
    options.body instanceof FormData

  const headers = {
    ...options.headers,
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`
  }

  return fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  )
}

export async function apiRequest(
  endpoint,
  options = {},
  allowRefresh = true,
) {
  const session = getSession()

  let response = await sendRequest(
    endpoint,
    options,
    session?.accessToken,
  )

  let data = await response.json()

  if (
    response.status === 401 &&
    allowRefresh
  ) {
    try {
      const newSession =
        await getRefreshedSession()

      response = await sendRequest(
        endpoint,
        options,
        newSession.accessToken,
      )

      data = await response.json()
    } catch {
      redirectToLogin()

      const error = new Error(
        'Tu sesión ha expirado. Inicia sesión nuevamente.',
      )

      error.status = 401

      throw error
    }
  }

  if (response.status === 401) {
    redirectToLogin()
  }

  if (!response.ok) {
    const error = new Error(
      data.message || 'Something went wrong',
    )

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}
