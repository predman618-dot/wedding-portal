import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/',          label: 'Dashboard',   icon: '⌂' },
  { to: '/finance',   label: 'Finances',    icon: '◈' },
  { to: '/vendors',   label: 'Vendors',     icon: '◎' },
  { to: '/checklist', label: 'Checklist',   icon: '✦' },
  { to: '/guests',    label: 'Guest List',  icon: '◇' },
]

// Placeholder — will be replaced with Netlify Identity user
const MOCK_USER = { name: 'Paul', initial: 'P', role: 'paul' }

export default function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      <button
        className="nav-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Backdrop on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99,
            display: 'none',
          }}
          className="nav-backdrop"
        />
      )}

      <nav className={`portal-nav${open ? ' open' : ''}`}>
        <div className="nav-brand">
          <div className="nav-brand-title">P & J</div>
          <div className="nav-brand-sub">Wedding Portal</div>
        </div>

        <div className="nav-links">
          <div className="nav-section-label">Planning</div>
          {LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-footer">
          <div className="nav-user">
            <div className={`nav-user-avatar ${MOCK_USER.role}`}>
              {MOCK_USER.initial}
            </div>
            <span>{MOCK_USER.name}</span>
          </div>
        </div>
      </nav>
    </>
  )
}
