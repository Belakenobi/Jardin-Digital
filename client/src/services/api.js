import { getSession } from './session.js'

const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(endpoint, options = {}) {
  const session = getSession()

  const isFormData =
    options.body instanceof FormData

  const headers = {
    ...options.headers,
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (session?.accessToken) {
    headers.Authorization =
      `Bearer ${session.accessToken}`
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Something went wrong',
    )
  }

  return data
}
