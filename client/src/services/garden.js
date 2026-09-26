import { apiRequest } from './api.js'

export function getGarden() {
  return apiRequest('/garden')
}

export function createGarden({
  name,
  description,
  isPublic,
}) {
  return apiRequest('/garden', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      isPublic,
    }),
  })
}

export function updateGarden({
  name,
  description,
  isPublic,
}) {
  return apiRequest('/garden', {
    method: 'PATCH',
    body: JSON.stringify({
      name,
      description,
      isPublic,
    }),
  })
}

export function deleteGarden() {
  return apiRequest('/garden', {
    method: 'DELETE',
  })
}
