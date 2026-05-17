import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { RoleRoute } from '../../components/ProtectedRoute'
import api from '../../api/axios'

const regBadge = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' }

export default function Registrations() {
  return (
    <RoleRoute roles={['admin', 'panitia']}>
      <RegistrationsContent />
    </RoleRoute>
  )
}

function RegistrationsContent() {
  const [regs, setRegs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [alert, setAlert]     = useState(null)

  const fetchRegs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/registrations')
      setRegs(Array.isArray(res.data) ? res.data : res.data.data ?? [])
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data registrasi.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRegs() }, [])

  const handleUpdate = async (id, status) => {
    try {
      await api.put(`/registrations/${id}`, { status })
      setAlert({ type: 'success', msg: `Registrasi berhasil di-${status}.` })
      fetchRegs()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memperbarui status.' })
    }
  }

  const filtered = regs.filter(r => {
    const matchSearch = r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.event?.title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? r.status === filterStatus : true
    return matchSearch && matchStatus
  })

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrasi Event</h1>
          <p className="page-subtitle">Kelola pendaftaran peserta ke event</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M6.5 0a6.5 6.5 0 104.43 11.136l3.217 3.217a.75.75 0 001.06-1.06l-3.217-3.218A6.5 6.5 0 006.5 0zm-5 6.5a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <input type="text" placeholder="Cari nama / event..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.msg}
          <button onClick={() => setAlert(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Peserta</th>
              <th>Event</th>
              <th>Tanggal Daftar</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <p className="empty-state-title">Belum ada registrasi</p>
                </div>
              </td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id}>
                <td className="text-muted text-xs">{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user?.email}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.event?.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.event?.location}</div>
                </td>
                <td className="text-muted text-xs">{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                <td><span className={`badge ${regBadge[r.status] ?? 'badge-neutral'}`}>{r.status}</span></td>
                <td>
                  {r.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleUpdate(r.id, 'approved')}>✓ Setujui</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleUpdate(r.id, 'rejected')}>✕ Tolak</button>
                    </div>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
