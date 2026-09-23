export async function fetchResponse(url, options) {
  try {
    return await fetch(url, options)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', { cause: error })
  }
}

export async function readResponse(response) {
  try {
    return await response.json()
  } catch {
    if (!response.ok) return {}
    throw new Error('No se pudo interpretar la respuesta del servidor. Inténtalo de nuevo.')
  }
}

export function responseError(response, data) {
  const messages = Object.values(data?.errors || {}).filter((message) => typeof message === 'string' && message.trim())
  const fallbacks = {
    400: 'Revisa los datos ingresados e inténtalo de nuevo.',
    401: 'No se pudo verificar tu acceso. Inicia sesión nuevamente.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'No se encontró el contenido solicitado. Actualiza la página.',
    409: 'Los datos entran en conflicto con un registro existente. Actualiza la página y revísalos.',
    413: 'El archivo o contenido es demasiado grande. Reduce su tamaño.',
    429: 'Has realizado demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
  }
  const fallback = fallbacks[response.status] || 'No se pudo completar la solicitud. Inténtalo de nuevo más tarde.'
  const message = response.status >= 500 ? fallback :
    messages.length ? messages.join(' ') :
      typeof data?.message === 'string' && data.message.trim() ? data.message : fallback
  const error = new Error(message)
  error.status = response.status
  error.data = data
  return error
}
