export function getFieldError(field) {
  if (field.disabled || !field.willValidate) return ''

  const label = field.labels?.[0]?.textContent.trim() ||
    field.getAttribute('aria-label') || 'Este campo'
  const value = field.value ?? ''

  if (field.type === 'file') {
    const file = field.files?.[0]
    if (!file) return field.required ? `${label}: selecciona una imagen.` : ''
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return `${label}: solo se permiten imágenes JPG, PNG o WEBP.`
    }
    if (file.size > 5 * 1024 * 1024) {
      return `${label}: la imagen debe pesar como máximo 5 MB.`
    }
    return ''
  }

  if (field.required && (field.validity.valueMissing || !value.trim())) {
    return `${label}: ${field.tagName === 'SELECT' ? 'selecciona una opción' : 'completa este campo; no puede contener solo espacios'}.`
  }
  if (!value) return ''
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return `${label}: escribe un correo válido, por ejemplo nombre@dominio.com.`
  }
  if (field.minLength > 0 && value.length < field.minLength) {
    return `${label}: usa al menos ${field.minLength} caracteres.`
  }
  if (field.maxLength >= 0 && value.length > field.maxLength) {
    return `${label}: usa como máximo ${field.maxLength} caracteres.`
  }
  if (!field.validity.valid) return `${label}: revisa el valor ingresado.`
  return ''
}
