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

  useEffect(() => {
    async function validateSession() {
      const session = getSession()

      if (!session?.accessToken) {
        setIsAuthenticated(false)
        setIsChecking(false)
        return
      }

      try {
        await getCurrentUser()

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
        <p className="text-stone-400">
          Validando sesión...
        </p>
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

  return children
}

export default ProtectedRoute
