import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Proteksi halaman — redirect ke /login jika belum login
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <span className="loading-spinner" />
        <span>Memuat...</span>
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// Proteksi berdasarkan role
export function RoleRoute({ roles, children, fallback = null }) {
  const { user } = useAuth()
  if (!user) return null
  if (!roles.includes(user.role)) {
    return fallback ?? (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <p className="empty-state-title">Akses Ditolak</p>
        <p className="empty-state-text">
          Kamu tidak memiliki izin untuk mengakses fitur ini.
        </p>
      </div>
    )
  }
  return children
}

// Tampilkan konten hanya jika user punya role tertentu (tidak redirect, cukup hidden)
export function ShowIfRole({ roles, children }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return null
  return children
}
