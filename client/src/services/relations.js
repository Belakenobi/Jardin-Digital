import { apiRequest } from './api.js'

export function getRelationsForNote(noteId) {
  return apiRequest(`/relations/note/${noteId}`)
}

export function createRelation({
  sourceNoteId,
  targetNoteId,
}) {
  return apiRequest('/relations', {
    method: 'POST',
    body: JSON.stringify({
      sourceNoteId,
      targetNoteId,
    }),
  })
}

export function deleteRelation(id) {
  return apiRequest(`/relations/${id}`, {
    method: 'DELETE',
  })
}
