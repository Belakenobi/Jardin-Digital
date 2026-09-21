import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { clearSession } from '../services/session.js'

function AppLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    navigate('/login')
  }

  function getLinkClass({ isActive }) {
    return [
      'rounded-xl px-4 py-3 transition',
      isActive
        ? 'bg-lime-400 font-medium text-stone-950'
        : 'text-stone-300 hover:bg-stone-800',
    ].join(' ')
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="w-64 border-r border-stone-800 bg-stone-900 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-lime-400">
            Digital Garden
          </p>

          <h1 className="mt-3 text-2xl font-semibold">
            Mi jardín
          </h1>

          <nav className="mt-10 flex flex-col gap-2">
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
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-10 w-full rounded-xl border border-stone-700 px-4 py-3 text-left text-stone-300 hover:bg-stone-800"
          >
            Cerrar sesión
          </button>
        </aside>

        <main className="min-w-0 flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
