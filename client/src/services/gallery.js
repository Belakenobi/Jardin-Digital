import { apiRequest } from './api.js'

export function getGalleryImages() {
  return apiRequest('/gallery')
}

export function uploadGalleryImage({
  file,
  description,
  noteId,
}) {
  const formData = new FormData()

  formData.append('image', file)

  if (description) {
    formData.append(
      'description',
      description,
    )
  }

  if (noteId) {
    formData.append(
      'noteId',
      noteId,
    )
  }

  return apiRequest('/gallery', {
    method: 'POST',
    body: formData,
  })
}

export function updateGalleryImage(
  id,
  {
    description,
    noteId,
  },
) {
  return apiRequest(`/gallery/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      description,
      noteId,
    }),
  })
}

export function deleteGalleryImage(id) {
  return apiRequest(`/gallery/${id}`, {
    method: 'DELETE',
  })
}
