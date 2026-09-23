import { fetchResponse, readResponse, responseError } from './http.js'

const API_URL = import.meta.env.VITE_API_URL

// Public reads must never refresh, clear or redirect an existing session.
async function publicRequest(endpoint) {
  const response = await fetchResponse(`${API_URL}${endpoint}`)
  const data = await readResponse(response)

  if (!response.ok) {
    throw responseError(response, data)
  }

  return data
}

export async function getPublicGarden(gardenId) {
  return publicRequest(
    `/public/gardens/${gardenId}`,
  )
}

export async function getPublicGardens() {
  return publicRequest('/public/gardens')
}
