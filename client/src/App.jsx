import {
  Navigate,
  Route,
  Routes,
  useOutletContext,
} from 'react-router-dom'

import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import AdminPage from './pages/AdminPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GalleryImageEditorPage from './pages/GalleryImageEditorPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import GalleryUploadPage from './pages/GalleryUploadPage.jsx'
import GraphPage from './pages/GraphPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NoteDetailPage from './pages/NoteDetailPage.jsx'
import NoteEditorPage from './pages/NoteEditorPage.jsx'
import NotesPage from './pages/NotesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PublicGardenPage from './pages/PublicGardenPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import RelationComposerPage from './pages/RelationComposerPage.jsx'
import RelationsPage from './pages/RelationsPage.jsx'

function AdminRoute() {
  const { currentUser } =
    useOutletContext()

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
        path="/garden/:gardenId/notes/:noteId"
        element={<PublicGardenPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            {(currentUser) => (
              <AppLayout
                currentUser={
                  currentUser
                }
              />
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
          path="/notes/new"
          element={<NoteEditorPage />}
        />

        <Route
          path="/notes/:noteId"
          element={<NoteDetailPage />}
        />

        <Route
          path="/notes/:noteId/edit"
          element={<NoteEditorPage />}
        />

        <Route
          path="/relations"
          element={<RelationsPage />}
        />

        <Route
          path="/relations/new"
          element={
            <RelationComposerPage />
          }
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
          path="/gallery/new"
          element={<GalleryUploadPage />}
        />

        <Route
          path="/gallery/:imageId/edit"
          element={
            <GalleryImageEditorPage />
          }
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
