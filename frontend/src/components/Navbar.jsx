import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppLogo from './AppLogo'

const IconGrid = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="nav-item-icon">
    <path d="M2 4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm10 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V4zM2 14a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4zm10 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" />
  </svg>
)
const IconUsers = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="nav-item-icon">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
)
const IconUser = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="nav-item-icon">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0010 0 5.986 5.986 0 00-.455.916A5 5 0 0010 11z" clipRule="evenodd" />
  </svg>
)
const IconFolder = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="nav-item-icon">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </svg>
)
const IconCalendar = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="nav-item-icon">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
)
const IconTag = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="nav-item-icon">
    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
)
const IconLogout = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
)

const navMenu = [
  {
    section: 'Menu Utama',
    items: [
      { to: '/dashboard',  label: 'Dashboard',  icon: <IconGrid />,     roles: ['admin','panitia'] },
      { to: '/events',     label: 'Event',       icon: <IconCalendar />, roles: ['admin','panitia','peserta'] },
      { to: '/categories', label: 'Kategori',    icon: <IconFolder />,   roles: ['admin','panitia','peserta'] },
      { to: '/tags',       label: 'Tag',         icon: <IconTag />,      roles: ['admin','panitia'] },
    ],
  },
  {
    section: 'Manajemen',
    items: [
      { to: '/registrations', label: 'Registrasi',     icon: <IconUsers />, roles: ['admin','panitia'] },
      { to: '/organizers',    label: 'Profil Panitia',  icon: <IconUser />,  roles: ['admin','panitia'] },
      { to: '/users',         label: 'Manajemen User',  icon: <IconUsers />, roles: ['admin'] },
    ],
  },
  {
    section: 'Akun',
    items: [
      { to: '/profile', label: 'Profil Saya', icon: <IconUser />, roles: ['admin','panitia','peserta'] },
    ],
  },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredMenu = navMenu
    .map(s => ({ ...s, items: s.items.filter(i => i.roles.includes(user?.role)) }))
    .filter(s => s.items.length > 0)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-icon" style={{ background: 'none', padding: 0, overflow: 'visible' }}>
            <AppLogo size={32} />
          </div>
          <span>Event Kampus</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map(section => (
          <div key={section.section}>
            <p className="nav-section-label">{section.section}</p>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-card">
            <div className="user-avatar">{getInitials(user.name)}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Keluar">
              <IconLogout />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
