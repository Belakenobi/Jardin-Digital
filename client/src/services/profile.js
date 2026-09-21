import { apiRequest } from './api.js'

export function getProfile() {
  return apiRequest('/profile')
}

export function updateProfile(displayName) {
  return apiRequest('/profile', {
    method: 'PATCH',
    body: JSON.stringify({
      displayName,
    }),
  })
}
