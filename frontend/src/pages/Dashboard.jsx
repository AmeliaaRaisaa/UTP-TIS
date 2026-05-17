import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'

function StatCard({ label, value, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="stat-card">
        <div className="stat-info">
          <div className="stat-value">{value ?? '—'}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </Link>
  )
}

function QuickLink({ to, label, desc }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
      >
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user, isAdmin, isOrganizer } = useAuth()
  const [stats, setStats] = useState({ events: null, categories: null, tags: null, users: null })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ev, cat, tag] = await Promise.all([
          api.get('/events'),
          api.get('/categories'),
          api.get('/tags'),
        ])
        setStats(s => ({
          ...s,
          events:     ev.data?.data?.length  ?? ev.data?.length  ?? 0,
          categories: cat.data?.data?.length ?? cat.data?.length ?? 0,
          tags:       tag.data?.data?.length ?? tag.data?.length ?? 0,
        }))
        if (isAdmin()) {
          const us = await api.get('/users')
          setStats(s => ({ ...s, users: us.data?.data?.length ?? us.data?.length ?? 0 }))
        }
      } catch {
        // biarkan stat tetap null jika gagal
      }
    }
    fetchStats()
  }, [])

  return (
    <Layout>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 24,
      }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          Halo, {user?.name}
        </p>
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.6rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Login sebagai <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{user?.role}</span>.
          Gunakan menu di kiri untuk navigasi.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Event"  value={stats.events}     to="/events" />
        <StatCard label="Kategori"     value={stats.categories} to="/categories" />
        <StatCard label="Tag"          value={stats.tags}       to="/tags" />
        {isAdmin() && (
          <StatCard label="User" value={stats.users} to="/users" />
        )}
      </div>

      <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Akses Cepat
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        <QuickLink to="/events"     label="Event"     desc="Lihat dan kelola event" />
        <QuickLink to="/categories" label="Kategori"  desc="Kelola kategori event" />
        <QuickLink to="/tags"       label="Tag"       desc="Kelola tag event" />
        {isOrganizer() && <QuickLink to="/organizers" label="Organizer" desc="Profil penyelenggara" />}
        {isAdmin()     && <QuickLink to="/users"      label="User"      desc="Manajemen akun" />}
      </div>
    </Layout>
  )
}
