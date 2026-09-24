import { NavLink } from 'react-router-dom'

function SidebarSection({
  label,
  number,
  items,
  isOpen,
  isActive,
  onToggle,
  onNavigate,
}) {
  const submenuId =
    `sidebar-${label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')}`

  return (
    <div className="sidebar-section">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={submenuId}
        onClick={onToggle}
        className={[
          'nav-link nav-parent flex items-center justify-between gap-4 px-3 py-3 text-sm transition',
          isActive
            ? 'nav-link--active'
            : '',
        ].join(' ')}
      >
        <span>{label}</span>

        <span className="flex items-center gap-3">
          <span aria-hidden="true">
            {number}
          </span>

          <span
            aria-hidden="true"
            className="submenu-arrow"
          >
            {isOpen ? '−' : '+'}
          </span>
        </span>
      </button>

      <div
        id={submenuId}
        className="sidebar-submenu"
        data-open={isOpen}
      >
        <div>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive: childActive }) =>
                [
                  'sidebar-sublink',
                  childActive
                    ? 'sidebar-sublink--active'
                    : '',
                ].join(' ')
              }
            >
              <span aria-hidden="true">
                —
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SidebarSection
