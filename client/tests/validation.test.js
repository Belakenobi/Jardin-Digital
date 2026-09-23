import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getFieldError } from '../src/utils/validation.js'

function field(overrides = {}) {
  return {
    willValidate: true,
    disabled: false,
    labels: [{ textContent: 'Nombre' }],
    getAttribute: () => null,
    type: 'text',
    tagName: 'INPUT',
    required: true,
    value: '',
    validity: { valid: true, valueMissing: false },
    minLength: -1,
    maxLength: -1,
    ...overrides,
  }
}

test('rejects empty and whitespace-only required fields', () => {
  for (const value of ['', '   ', '\t\n']) {
    assert.match(getFieldError(field({ value })), /Nombre: completa este campo/)
  }
  assert.equal(getFieldError(field({ value: ' Isabella ' })), '')
  assert.equal(getFieldError(field({ required: false })), '')
  assert.equal(getFieldError(field({ disabled: true })), '')
})

test('explains missing selections and malformed emails', () => {
  assert.match(getFieldError(field({ tagName: 'SELECT' })), /selecciona una opción/)
  assert.match(getFieldError(field({ type: 'email', value: 'invalid@' })), /correo válido/)
  assert.equal(getFieldError(field({ type: 'email', value: 'name@example.com' })), '')
})

test('validates minimum and maximum lengths including programmatic values', () => {
  assert.match(getFieldError(field({ type: 'password', value: '1234567', minLength: 8 })), /al menos 8/)
  assert.equal(getFieldError(field({ type: 'password', value: '12345678', minLength: 8 })), '')
  assert.match(getFieldError(field({ value: 'a'.repeat(81), maxLength: 80 })), /máximo 80/)
  assert.equal(getFieldError(field({ value: 'a'.repeat(80), maxLength: 80 })), '')
})

test('validates image presence, type and the exact 5 MB boundary', () => {
  const image = (files) => field({ type: 'file', files })
  assert.match(getFieldError(image([])), /selecciona una imagen/)
  assert.match(getFieldError(image([{ type: 'image/gif', size: 100 }])), /JPG, PNG o WEBP/)
  assert.match(getFieldError(image([{ type: 'image/png', size: 5 * 1024 * 1024 + 1 }])), /máximo 5 MB/)
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
    assert.equal(getFieldError(image([{ type, size: 5 * 1024 * 1024 }])), '')
  }
})
