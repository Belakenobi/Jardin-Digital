import {
  Navigate,
  Route,
  Routes,
  useOutletContext,
} from 'react-router-dom'

import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import DashboardPage from './pages/DashboardPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotesPage from './pages/NotesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import RelationsPage from './pages/RelationsPage.jsx'
import GraphPage from './pages/GraphPage.jsx'
import PublicGardenPage from './pages/PublicGardenPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

function AdminRoute() {
  const { currentUser } = useOutletContext()

  if (currentUser?.role !== 'admin') {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <AdminPage />
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/garden/:gardenId"
        element={<PublicGardenPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            {(currentUser) => (
              <AppLayout currentUser={currentUser} />
            )}
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/notes"
          element={<NotesPage />}
        />

        <Route
          path="/relations"
          element={<RelationsPage />}
        />

        <Route
          path="/graph"
          element={<GraphPage />}
        />

        <Route
          path="/gallery"
          element={<GalleryPage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/admin"
          element={<AdminRoute />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  )
}

export default App
