import {
  useEffect,
  useState,
} from 'react'

import { Navigate } from 'react-router-dom'

import { getCurrentUser } from '../services/auth.js'
import { getSession } from '../services/session.js'

function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] =
    useState(true)

  const [isAuthenticated, setIsAuthenticated] =
    useState(false)

  const [currentUser, setCurrentUser] =
    useState(null)

  useEffect(() => {
    async function validateSession() {
      const session = getSession()

      if (!session?.accessToken) {
        setIsAuthenticated(false)
        setIsChecking(false)
        return
      }

      try {
        const response = await getCurrentUser()

        setCurrentUser(response.data.user)
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    validateSession()
  }, [])

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-100">
        <div className="text-center">
          <p aria-hidden="true" className="text-3xl">🌱</p>
          <p className="mt-3 text-stone-400">Validando sesión...
          </p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return typeof children === 'function'
    ? children(currentUser)
    : children
}

export default ProtectedRoute
