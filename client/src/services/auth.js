import { apiRequest } from './api.js'

export function loginUser({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  }, false)
}

export function registerUser({
  displayName,
  email,
  password,
}) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      displayName,
      email,
      password,
    }),
  }, false)
}

export function getCurrentUser() {
  return apiRequest('/auth/me')
}
