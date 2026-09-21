import { Navigate } from 'react-router-dom'
import { getSession } from '../services/session.js'

function ProtectedRoute({ children }) {
  const session = getSession()

  if (!session?.accessToken) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
