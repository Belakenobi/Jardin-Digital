import assert from 'node:assert/strict'
import { afterEach, beforeEach, mock, test } from 'node:test'
import { apiRequest } from '../src/services/api.js'
import { loginUser, registerUser } from '../src/services/auth.js'
import { getSession, saveSession } from '../src/services/session.js'

const storage = new Map()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
})
globalThis.window = { location: { pathname: '/register', href: '/register' } }

beforeEach(() => {
  storage.clear()
  window.location.href = '/register'
})
afterEach(() => mock.restoreAll())

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), { status })
}

test('login and registration failures retain their message without refreshing or redirecting', async () => {
  for (const submit of [loginUser, registerUser]) {
    const fetchMock = mock.method(globalThis, 'fetch', async () => jsonResponse(401, { message: 'El correo o la contraseña son incorrectos.' }))
    saveSession({ accessToken: 'old-access', refreshToken: 'old-refresh' })
    await assert.rejects(submit({ email: 'name@example.com', password: 'wrong-password' }), /correo o la contraseña/)
    assert.equal(fetchMock.mock.calls.length, 1)
    assert.equal(window.location.href, '/register')
    assert.equal(getSession().accessToken, 'old-access')
    mock.restoreAll()
  }
})

test('preserves all field validation details instead of a generic summary', async () => {
  mock.method(globalThis, 'fetch', async () => jsonResponse(400, {
    message: 'Revisa los datos.',
    errors: { email: 'Escribe un correo válido.', password: 'Usa al menos 8 caracteres.' },
  }))
  await assert.rejects(registerUser({}), (error) => {
    assert.match(error.message, /correo válido/)
    assert.match(error.message, /al menos 8/)
    assert.equal(error.status, 400)
    assert.equal(error.data.errors.email, 'Escribe un correo válido.')
    return true
  })
})

test('network and non-JSON server failures have actionable messages', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch') })
  await assert.rejects(apiRequest('/notes'), /Revisa tu conexión/)
  fetchMock.mock.mockImplementation(async () => new Response('<html>Bad Gateway</html>', { status: 502 }))
  await assert.rejects(apiRequest('/notes'), (error) => error.status === 502 && /Inténtalo de nuevo/.test(error.message))
  fetchMock.mock.mockImplementation(async () => jsonResponse(500, { message: 'Internal database details' }))
  await assert.rejects(apiRequest('/notes'), (error) => !error.message.includes('database'))
})

test('protected requests still refresh a valid session and retry', async () => {
  saveSession({ accessToken: 'old-access', refreshToken: 'old-refresh' })
  const responses = [
    jsonResponse(401, {}),
    jsonResponse(200, { data: { session: { accessToken: 'new-access', refreshToken: 'new-refresh' } } }),
    jsonResponse(200, { notes: [] }),
  ]
  const fetchMock = mock.method(globalThis, 'fetch', async () => responses.shift())
  assert.deepEqual(await apiRequest('/notes'), { notes: [] })
  assert.equal(fetchMock.mock.calls.length, 3)
  assert.equal(fetchMock.mock.calls[2].arguments[1].headers.Authorization, 'Bearer new-access')
  assert.equal(getSession().refreshToken, 'new-refresh')
})

test('a rejected refresh expires the session; a connection failure preserves it', async () => {
  saveSession({ accessToken: 'old-access', refreshToken: 'old-refresh' })
  let calls = 0
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    if (++calls === 1) return jsonResponse(401, {})
    throw new TypeError('Failed to fetch')
  })
  await assert.rejects(apiRequest('/notes'), /Revisa tu conexión/)
  assert.equal(getSession().accessToken, 'old-access')
  assert.equal(window.location.href, '/register')
  fetchMock.mock.mockImplementation(async () => jsonResponse(401, {}))
  await assert.rejects(apiRequest('/notes'), /sesión ha expirado/)
  assert.equal(getSession(), null)
  assert.equal(window.location.href, '/login')
})
