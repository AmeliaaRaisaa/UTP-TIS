import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'

const regBadge = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' }
const regLabel = { pending: 'Menunggu', approved: 'Diterima', rejected: 'Ditolak' }
const statusBadge = { published: 'badge-success', draft: 'badge-neutral', closed: 'badge-danger' }
const statusLabel = { published: 'Tayang', draft: 'Draft', closed: 'Ditutup' }

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [regs, setRegs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert]     = useState(null)

  // Edit profil
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm]         = useState({ name: '', email: '' })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving]     = useState(false)

  const fetchRegs = async () => {
    try {
      const res = await api.get('/registrations/my')
      setRegs(Array.isArray(res.data) ? res.data : res.data.data ?? [])
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data registrasi.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRegs() }, [])

  const openEdit = () => {
    setForm({ name: user?.name ?? '', email: user?.email ?? '' })
    setFormErrors({})
    setShowEdit(true)
  }

  const handleSaveProfile = async () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nama wajib diisi.'
    if (!form.email.trim()) errs.email = 'Email wajib diisi.'
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      await api.put(`/users/${user.id}`, { name: form.name, email: form.email })
      await refreshUser()
      setShowEdit(false)
      setAlert({ type: 'success', msg: 'Profil berhasil diperbarui.' })
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        const mapped = {}
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setFormErrors(mapped)
      } else {
        setFormErrors({ general: data?.message || 'Gagal menyimpan.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (regId) => {
    if (!window.confirm('Batalkan pendaftaran ini?')) return
    try {
      await api.delete(`/registrations/${regId}`)
      setAlert({ type: 'success', msg: 'Pendaftaran berhasil dibatalkan.' })
      fetchRegs()
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Gagal membatalkan.' })
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-subtitle">Informasi akun dan riwayat pendaftaran event</p>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.msg}
          <button onClick={() => setAlert(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* Info profil */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
              <span className="badge badge-neutral" style={{ marginTop: 6, fontSize: '0.72rem' }}>{user?.role}</span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={openEdit}>Edit Profil</button>
        </div>
      </div>

      {/* Riwayat registrasi */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Riwayat Pendaftaran Event
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {regs.length} event terdaftar
        </p>
      </div>

      {loading ? (
        <div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div>
      ) : regs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎪</div>
          <p className="empty-state-title">Belum ada pendaftaran</p>
          <p className="empty-state-text">Daftar ke event yang tersedia di halaman Event.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {regs.map(r => (
            <div key={r.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className={`badge ${statusBadge[r.event?.status]}`} style={{ fontSize: '0.7rem' }}>
                      {statusLabel[r.event?.status]}
                    </span>
                    {r.event?.category && (
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{r.event.category.name}</span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {r.event?.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>📍 {r.event?.location}</span>
                    <span>📅 {r.event?.event_date ? new Date(r.event.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
                    <span>👥 {r.event?.capacity} orang</span>
                  </div>
                  {r.note && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Catatan: {r.note}
                    </div>
                  )}
                  {r.event?.tags?.length > 0 && (
                    <div className="tag-chips" style={{ marginTop: 8 }}>
                      {r.event.tags.map(t => (
                        <span key={t.id} className="tag-chip">
                          <span className="color-dot" style={{ background: t.color }} />
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span className={`badge ${regBadge[r.status]}`} style={{ fontSize: '0.8rem' }}>
                    {regLabel[r.status]}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Daftar: {new Date(r.created_at).toLocaleDateString('id-ID')}
                  </div>
                  {r.status === 'pending' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.id)}>
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal edit profil */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profil">
        {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
        <div className="form-group">
          <label className="form-label">Nama Lengkap *</label>
          <input className="form-input" value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(er => ({ ...er, name: '' })) }} />
          {formErrors.name && <p className="form-error">{formErrors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={form.email}
            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFormErrors(er => ({ ...er, email: '' })) }} />
          {formErrors.email && <p className="form-error">{formErrors.email}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowEdit(false)} disabled={saving}>Batal</button>
          <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
            {saving ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Menyimpan...</> : 'Simpan'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}
