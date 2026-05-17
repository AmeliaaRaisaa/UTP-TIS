import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import AdminDashboard from './dashboard/AdminDashboard'
import PanitiaDashboard from './dashboard/PanitiaDashboard'

export default function Dashboard() {
  const { user } = useAuth()

  // Peserta tidak punya dashboard — redirect ke events
  if (user?.role === 'peserta') {
    return <Navigate to="/events" replace />
  }

  return (
    <Layout>
      {/* Header selamat datang */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 2 }}>
            Selamat datang kembali,
          </p>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {user?.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Login sebagai{' '}
            <span style={{
              color: user?.role === 'admin' ? 'var(--primary)' : 'var(--success)',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {user?.role}
            </span>
          </p>
        </div>
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          {user?.name?.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Render dashboard sesuai role */}
      {user?.role === 'admin'   && <AdminDashboard />}
      {user?.role === 'panitia' && <PanitiaDashboard />}
    </Layout>
  )
}
