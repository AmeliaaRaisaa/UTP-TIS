import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'


function StatCard({ icon, label, value, to, color = 'var(--primary)' }) {
  const inner = (
    <div className="stat-card" style={{ cursor: to ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ background: color + '20', color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value ?? <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      {action}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [events, setEvents] = useState([])
  const [users, setUsers]   = useState([])
  const [regs, setRegs]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, eRes, uRes, rRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/events'),
          api.get('/users'),
          api.get('/registrations'),
        ])
        setStats(sRes.data.data)
        setEvents(Array.isArray(eRes.data) ? eRes.data : eRes.data.data ?? [])
        setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data.data ?? [])
        setRegs(Array.isArray(rRes.data) ? rRes.data : rRes.data.data ?? [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusBadge = { published: 'badge-success', draft: 'badge-neutral', closed: 'badge-danger' }
  const statusLabel = { published: 'Tayang', draft: 'Draft', closed: 'Ditutup' }
  const roleColor   = { admin: 'badge-primary', panitia: 'badge-success', peserta: 'badge-neutral' }
  const regBadge    = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <StatCard icon="🎪" label="Total Event"       value={stats?.totalEvents}        to="/events"     color="var(--primary)" />
        <StatCard icon="👥" label="Total User"        value={stats?.totalUsers}         to="/users"      color="var(--success)" />
        <StatCard icon="📋" label="Total Registrasi"  value={stats?.totalRegistrations} to="/registrations" color="var(--warning)" />
        <StatCard icon="🗂️" label="Kategori"          value={stats?.totalCategories}    to="/categories" color="#a78bfa" />
      </div>

      {/* Breakdown status registrasi */}
      {stats?.byStatus && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {Object.entries(stats.byStatus).map(([s, n]) => (
            <div key={s} className={`badge ${regBadge[s] ?? 'badge-neutral'}`} style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
              {s}: {n}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Event terbaru */}
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader
            title="Event Terbaru"
            action={<Link to="/events" className="btn btn-ghost btn-sm">Lihat semua →</Link>}
          />
          {loading ? (
            <div className="loading-center" style={{ padding: 30 }}><span className="loading-spinner" /></div>
          ) : events.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada event.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.slice(0, 5).map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.category?.name} · {new Date(ev.event_date).toLocaleDateString('id-ID')}</div>
                  </div>
                  <span className={`badge ${statusBadge[ev.status]}`}>{statusLabel[ev.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User terbaru */}
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader
            title="User Terbaru"
            action={<Link to="/users" className="btn btn-ghost btn-sm">Lihat semua →</Link>}
          />
          {loading ? (
            <div className="loading-center" style={{ padding: 30 }}><span className="loading-spinner" /></div>
          ) : users.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada user.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {users.slice(0, 5).map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  <span className={`badge ${roleColor[u.role] ?? 'badge-neutral'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registrasi terbaru */}
      <div className="card" style={{ padding: 20 }}>
        <SectionHeader
          title="Registrasi Terbaru"
          action={<Link to="/registrations" className="btn btn-ghost btn-sm">Lihat semua →</Link>}
        />
        {loading ? (
          <div className="loading-center" style={{ padding: 30 }}><span className="loading-spinner" /></div>
        ) : regs.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">Belum ada registrasi</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Peserta</th>
                  <th>Event</th>
                  <th>Tanggal Daftar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {regs.slice(0, 8).map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user?.email}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r.event?.title}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                    <td><span className={`badge ${regBadge[r.status] ?? 'badge-neutral'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Breakdown per kategori */}
      {stats?.byCategory?.length > 0 && (
        <div className="card" style={{ padding: 20, marginTop: 24 }}>
          <SectionHeader title="Event per Kategori" />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {stats.byCategory.map(c => (
              <div key={c.name} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 16px', minWidth: 120 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{c.total}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
