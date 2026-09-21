import { apiRequest } from './api.js'

export function getNotes(maturity) {
  const query = maturity
    ? `?maturity=${encodeURIComponent(maturity)}`
    : ''

  return apiRequest(`/notes${query}`)
}

export function getNoteById(id) {
  return apiRequest(`/notes/${id}`)
}

export function createNote({
  title,
  content,
  maturity,
}) {
  return apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify({
      title,
      content,
      maturity,
    }),
  })
}

export function updateNote(
  id,
  {
    title,
    content,
    maturity,
  },
) {
  return apiRequest(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title,
      content,
      maturity,
    }),
  })
}

export function deleteNote(id) {
  return apiRequest(`/notes/${id}`, {
    method: 'DELETE',
  })
}
