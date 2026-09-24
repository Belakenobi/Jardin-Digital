import {
  useEffect,
  useState,
} from 'react'

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import SidebarSection from './SidebarSection.jsx'
import { clearSession } from '../services/session.js'

const sections = [
  {
    id: 'ideas',
    label: 'Ideas',
    number: '02',
    prefix: '/notes',
    items: [
      {
        to: '/notes',
        label: 'Explorar ideas',
        end: true,
      },
      {
        to: '/notes/new',
        label: 'Plantar una idea',
      },
    ],
  },
  {
    id: 'relations',
    label: 'Relaciones',
    number: '03',
    prefix: '/relations',
    items: [
      {
        to: '/relations',
        label: 'Explorar conexiones',
        end: true,
      },
      {
        to: '/relations/new',
        label: 'Conectar ideas',
      },
    ],
  },
  {
    id: 'gallery',
    label: 'Galería',
    number: '05',
    prefix: '/gallery',
    items: [
      {
        to: '/gallery',
        label: 'Recorrer galería',
        end: true,
      },
      {
        to: '/gallery/new',
        label: 'Guardar recuerdo',
      },
    ],
  },
]

function getSectionForPath(pathname) {
  return sections.find((section) =>
    pathname.startsWith(section.prefix),
  )?.id ?? null
}

function AppLayout({ currentUser }) {
  const navigate = useNavigate()
  const location = useLocation()

  const activeSection =
    getSectionForPath(
      location.pathname,
    )

  const [openSection, setOpenSection] =
    useState(activeSection)

  const [mobileOpen, setMobileOpen] =
    useState(false)

  useEffect(() => {
    const frame =
      requestAnimationFrame(() => {
        setOpenSection(activeSection)
        setMobileOpen(false)
      })

    return () =>
      cancelAnimationFrame(frame)
  }, [
    activeSection,
    location.pathname,
  ])

  function handleLogout() {
    clearSession()
    navigate('/login')
  }

  function directLinkClass({
    isActive,
  }) {
    return [
      'nav-link group flex items-center justify-between gap-5 border-b px-3 py-3 text-sm transition',
      isActive
        ? 'nav-link--active font-semibold'
        : 'border-stone-700 text-stone-300 hover:border-lime-400 hover:text-lime-400',
    ].join(' ')
  }

  function closeMobileNavigation() {
    setMobileOpen(false)
  }

  function handleDirectNavigation() {
    setOpenSection(null)
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="app-sidebar border-b border-stone-800 bg-stone-900 px-4 py-4 md:min-h-screen md:w-72 md:flex-shrink-0 md:border-b-0 md:border-r md:px-6 md:py-7">
          <div className="md:sticky md:top-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="eyebrow">
                  Archivo vivo · 01
                </p>

                <p className="sidebar-brand mt-1 text-2xl font-semibold leading-none md:mt-3 md:text-3xl">
                  Digital
                  <br />
                  Garden
                </p>
              </div>

              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="primary-navigation"
                onClick={() =>
                  setMobileOpen(
                    (current) =>
                      !current,
                  )
                }
                className="sidebar-menu-toggle secondary-action"
              >
                {mobileOpen
                  ? 'Cerrar'
                  : 'Menú'}
              </button>
            </div>

            <nav
              id="primary-navigation"
              aria-label="Navegación principal"
              className="sidebar-nav md:mt-12"
              data-open={mobileOpen}
            >
              <div>
                <NavLink
                  to="/dashboard"
                  onClick={
                    handleDirectNavigation
                  }
                  className={
                    directLinkClass
                  }
                >
                  <span>Inicio</span>
                  <span aria-hidden="true">
                    01
                  </span>
                </NavLink>

                <SidebarSection
                  {...sections[0]}
                  isOpen={
                    openSection ===
                    'ideas'
                  }
                  isActive={
                    activeSection ===
                    'ideas'
                  }
                  onToggle={() =>
                    setOpenSection(
                      openSection ===
                        'ideas'
                        ? null
                        : 'ideas',
                    )
                  }
                  onNavigate={
                    closeMobileNavigation
                  }
                />

                <SidebarSection
                  {...sections[1]}
                  isOpen={
                    openSection ===
                    'relations'
                  }
                  isActive={
                    activeSection ===
                    'relations'
                  }
                  onToggle={() =>
                    setOpenSection(
                      openSection ===
                        'relations'
                        ? null
                        : 'relations',
                    )
                  }
                  onNavigate={
                    closeMobileNavigation
                  }
                />

                <NavLink
                  to="/graph"
                  onClick={
                    handleDirectNavigation
                  }
                  className={
                    directLinkClass
                  }
                >
                  <span>Grafo</span>
                  <span aria-hidden="true">
                    04
                  </span>
                </NavLink>

                <SidebarSection
                  {...sections[2]}
                  isOpen={
                    openSection ===
                    'gallery'
                  }
                  isActive={
                    activeSection ===
                    'gallery'
                  }
                  onToggle={() =>
                    setOpenSection(
                      openSection ===
                        'gallery'
                        ? null
                        : 'gallery',
                    )
                  }
                  onNavigate={
                    closeMobileNavigation
                  }
                />

                <NavLink
                  to="/profile"
                  onClick={
                    handleDirectNavigation
                  }
                  className={
                    directLinkClass
                  }
                >
                  <span>
                    Perfil y jardín
                  </span>
                  <span aria-hidden="true">
                    06
                  </span>
                </NavLink>

                {currentUser?.role ===
                  'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={
                      handleDirectNavigation
                    }
                    className={
                      directLinkClass
                    }
                  >
                    <span>Admin</span>
                    <span aria-hidden="true">
                      07
                    </span>
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="logout-action mt-8 w-full"
                >
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-7 lg:px-12 lg:py-10">
          <div className="w-full max-w-7xl">
            <Outlet
              context={{ currentUser }}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
