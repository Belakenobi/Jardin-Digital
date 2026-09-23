import { apiRequest } from './api.js'

export function getAdminSummary() {
  return apiRequest('/admin/summary')
}

export function getAdminUsers() {
  return apiRequest('/admin/users')
}
