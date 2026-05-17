import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'
import Modal from '../../components/Modal'

const statusBadge = { published: 'badge-success', draft: 'badge-neutral', closed: 'badge-danger' }
const statusLabel = { published: 'Tayang', draft: 'Draft', closed: 'Ditutup' }
const regBadge    = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' }

function StatCard({ icon, label, value, color = 'var(--primary)' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '20', color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value ?? <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

export default function PanitiaDashboard() {
  const { user } = useAuth()
  const [stats, setStats]         = useState(null)
  const [myEvents, setMyEvents]   = useState([])
  const [regs, setRegs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [alert, setAlert]         = useState(null)

  // Modal detail registrasi per event
  const [showRegs, setShowRegs]   = useState(false)
  const [selEvent, setSelEvent]   = useState(null)
  const [eventRegs, setEventRegs] = useState([])
  const [loadingRegs, setLoadingRegs] = useState(false)

  const load = async () => {
    try {
      const [sRes, eRes, rRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/events'),
        api.get('/registrations'),
      ])
      setStats(sRes.data.data)
      const allEvents = Array.isArray(eRes.data) ? eRes.data : eRes.data.data ?? []
      // Panitia hanya lihat event miliknya
      setMyEvents(allEvents.filter(ev => ev.created_by === user?.id))
      setRegs(Array.isArray(rRes.data) ? rRes.data : rRes.data.data ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user])

  const openEventRegs = async (ev) => {
    setSelEvent(ev)
    setShowRegs(true)
    setLoadingRegs(true)
    try {
      const res = await api.get(`/events/${ev.id}/registrations`)
      setEventRegs(Array.isArray(res.data) ? res.data : res.data.data ?? [])
    } catch {
      setEventRegs([])
    } finally {
      setLoadingRegs(false)
    }
  }

  const handleUpdateReg = async (regId, status) => {
    try {
      await api.put(`/registrations/${regId}`, { status })
      setAlert({ type: 'success', msg: `Registrasi berhasil di-${status}.` })
      // Refresh list
      const res = await api.get(`/events/${selEvent.id}/registrations`)
      setEventRegs(Array.isArray(res.data) ? res.data : res.data.data ?? [])
      load()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memperbarui status.' })
    }
  }

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.msg}
          <button onClick={() => setAlert(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: 28 }}>
        <StatCard icon="🎪" label="Event Saya"          value={stats?.myEvents}              color="var(--primary)" />
        <StatCard icon="📋" label="Total Pendaftar"     value={stats?.myRegistrations}       color="var(--success)" />
        <StatCard icon="⏳" label="Menunggu Persetujuan" value={stats?.pendingRegistrations}  color="var(--warning)" />
      </div>

      {/* Profil panitia */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email} · <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>panitia</span></div>
          </div>
        </div>
        <Link to="/organizers" className="btn btn-outline btn-sm">Edit Profil Organisasi</Link>
      </div>

      {/* Event saya */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Event Saya</h2>
          <Link to="/events" className="btn btn-primary btn-sm">+ Buat Event</Link>
        </div>

        {loading ? (
          <div className="loading-center" style={{ padding: 30 }}><span className="loading-spinner" /></div>
        ) : myEvents.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-icon">🎪</div>
            <p className="empty-state-title">Belum ada event</p>
            <p className="empty-state-text">Buat event pertamamu sekarang.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Tanggal</th>
                  <th>Kapasitas</th>
                  <th>Status</th>
                  <th>Pendaftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map(ev => {
                  const evRegs = regs.filter(r => r.event_id === ev.id)
                  const pending = evRegs.filter(r => r.status === 'pending').length
                  return (
                    <tr key={ev.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.category?.name}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(ev.event_date).toLocaleDateString('id-ID')}
                      </td>
                      <td><span className="badge badge-primary">{ev.capacity}</span></td>
                      <td><span className={`badge ${statusBadge[ev.status]}`}>{statusLabel[ev.status]}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{evRegs.length}</span>
                          {pending > 0 && (
                            <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>{pending} pending</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEventRegs(ev)}>
                            Pendaftar
                          </button>
                          <Link to="/events" className="btn btn-outline btn-sm">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: daftar pendaftar per event */}
      <Modal open={showRegs} onClose={() => setShowRegs(false)} title={`Pendaftar — ${selEvent?.title}`} size="lg">
        {loadingRegs ? (
          <div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div>
        ) : eventRegs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">Belum ada pendaftar</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Tanggal Daftar</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {eventRegs.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.user?.name}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.user?.email}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                    <td><span className={`badge ${regBadge[r.status]}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdateReg(r.id, 'approved')}>✓ Setujui</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleUpdateReg(r.id, 'rejected')}>✕ Tolak</button>
                        </div>
                      )}
                      {r.status !== 'pending' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowRegs(false)}>Tutup</button>
        </div>
      </Modal>
    </div>
  )
}
