import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { clearSession } from '../services/session.js'

function AppLayout({ currentUser }) {
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    navigate('/login')
  }

  function getLinkClass({ isActive }) {
    return [
      'rounded-xl px-4 py-3 text-sm transition',
      isActive
        ? 'bg-lime-400 font-medium text-stone-950'
        : 'text-stone-300 hover:bg-stone-800',
    ].join(' ')
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-stone-800 bg-stone-900 p-4 md:min-h-screen md:w-64 md:flex-shrink-0 md:border-b-0 md:border-r md:p-6">
          <div className="md:sticky md:top-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-lime-400">
                Digital Garden
              </p>

              <h1 className="mt-2 text-xl font-semibold md:mt-3 md:text-2xl">
                Mi jardín
              </h1>
            </div>

            <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 md:mt-10 md:flex-col md:overflow-visible md:pb-0">
              <NavLink
                to="/dashboard"
                className={getLinkClass}
              >
                Inicio
              </NavLink>

              <NavLink
                to="/notes"
                className={getLinkClass}
              >
                Notas
              </NavLink>

              <NavLink
                to="/relations"
                className={getLinkClass}
              >
                Relaciones
              </NavLink>


              <NavLink
                to="/graph"
                className={getLinkClass}
              >
                Grafo
              </NavLink>

              <NavLink
                to="/gallery"
                className={getLinkClass}
              >
                Galería
              </NavLink>

              <NavLink
                to="/profile"
                className={getLinkClass}
              >
                Perfil y jardín
              </NavLink>

              {currentUser?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={getLinkClass}
                >
                  Admin
                </NavLink>
              )}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 rounded-xl border border-stone-700 px-4 py-3 text-sm text-stone-300 transition hover:bg-stone-800 md:mt-10 md:w-full md:text-left"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet context={{ currentUser }} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
