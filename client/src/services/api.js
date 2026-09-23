import {
  clearSession,
  getSession,
  saveSession,
} from './session.js'
import { fetchResponse, readResponse, responseError } from './http.js'

const API_URL = import.meta.env?.VITE_API_URL

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
    const error = new Error('Tu sesión ha expirado. Inicia sesión nuevamente.')
    error.status = 401
    throw error
  }

  const response = await fetchResponse(
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

  const data = await readResponse(response)

  if (!response.ok) {
    throw responseError(response, data)
  }

  const newSession = data.data?.session

  if (
    !newSession?.accessToken ||
    !newSession?.refreshToken
  ) {
    throw new Error(
      'No se pudo renovar tu sesión. Inténtalo de nuevo.',
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

  return fetchResponse(
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

  let data = await readResponse(response)

  if (
    response.status === 401 &&
    allowRefresh
  ) {
    let newSession
    try {
      newSession = await getRefreshedSession()
    } catch (refreshError) {
      if (refreshError.status !== 400 && refreshError.status !== 401) {
        throw refreshError
      }
      redirectToLogin()

      const error = new Error(
        'Tu sesión ha expirado. Inicia sesión nuevamente.',
      )

      error.status = 401

      throw error
    }

    response = await sendRequest(endpoint, options, newSession.accessToken)
    data = await readResponse(response)
  }

  if (response.status === 401 && allowRefresh) {
    redirectToLogin()
  }

  if (!response.ok) {
    throw responseError(response, data)
  }

  return data
}
