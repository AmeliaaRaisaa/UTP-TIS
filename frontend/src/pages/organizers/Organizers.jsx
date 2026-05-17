import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { RoleRoute, ShowIfRole } from '../../components/ProtectedRoute'
import api from '../../api/axios'

const emptyForm = { user_id: '', phone: '', organization_name: '', bio: '' }

export default function Organizers() {
  return (
    <RoleRoute roles={['admin', 'panitia']}>
      <OrganizersContent />
    </RoleRoute>
  )
}

function OrganizersContent() {
  const [profiles, setProfiles] = useState([])
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  const [showForm,   setShowForm]   = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [form,       setForm]       = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)
  const [alert,      setAlert]      = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, uRes] = await Promise.all([api.get('/organizer-profiles'), api.get('/users')])
      setProfiles(Array.isArray(pRes.data) ? pRes.data : pRes.data.data ?? [])
      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data.data ?? [])
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const usedUserIds = new Set(profiles.map(p => p.user_id))

  const openCreate = () => {
    setSelected(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowForm(true)
  }

  const openEdit = (p) => {
    setSelected(p)
    setForm({ user_id: p.user_id, phone: p.phone, organization_name: p.organization_name, bio: p.bio ?? '' })
    setFormErrors({})
    setShowForm(true)
  }

  const openDetail = (p) => { setSelected(p); setShowDetail(true) }

  const validate = () => {
    const errs = {}
    if (!form.user_id)                errs.user_id           = 'Pilih user.'
    if (!form.phone.trim())           errs.phone             = 'Nomor telepon wajib diisi.'
    if (!/^[0-9]+$/.test(form.phone)) errs.phone             = 'Nomor telepon hanya boleh angka.'
    if (!form.organization_name.trim()) errs.organization_name = 'Nama organisasi wajib diisi.'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      if (selected) {
        await api.put(`/organizer-profiles/${selected.id}`, form)
        setAlert({ type: 'success', msg: 'Profil berhasil diperbarui.' })
      } else {
        await api.post('/organizer-profiles', form)
        setAlert({ type: 'success', msg: 'Profil berhasil dibuat.' })
      }
      setShowForm(false)
      fetchData()
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

  const handleDelete = async (p) => {
    if (!window.confirm(`Hapus profil organizer "${p.organization_name}"?`)) return
    try {
      await api.delete(`/organizer-profiles/${p.id}`)
      setAlert({ type: 'success', msg: 'Profil berhasil dihapus.' })
      fetchData()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal menghapus profil.' })
    }
  }

  const filtered = profiles.filter(p =>
    p.organization_name.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizer Profile</h1>
          <p className="page-subtitle">Profil penyelenggara event kampus</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M6.5 0a6.5 6.5 0 104.43 11.136l3.217 3.217a.75.75 0 001.06-1.06l-3.217-3.218A6.5 6.5 0 006.5 0zm-5 6.5a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <input type="text" placeholder="Cari organizer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <ShowIfRole roles={['admin', 'panitia']}>
            <button className="btn btn-primary" onClick={openCreate}>
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              Tambah Profil
            </button>
          </ShowIfRole>
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
              <th>Organisasi</th>
              <th>User</th>
              <th>Nomor Telepon</th>
              <th>Bio</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">👤</div>
                  <p className="empty-state-title">Belum ada profil organizer</p>
                </div>
              </td></tr>
            ) : filtered.map((p, i) => (
              <tr key={p.id}>
                <td className="text-muted text-xs">{i + 1}</td>
                <td>
                  <span className="td-main" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => openDetail(p)}>
                    {p.organization_name}
                  </span>
                </td>
                <td>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.user?.name ?? '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.email ?? ''}</div>
                  </div>
                </td>
                <td className="text-sm">{p.phone}</td>
                <td className="truncate" style={{ maxWidth: 220 }}>
                  {p.bio ? <span className="text-sm">{p.bio}</span> : <span className="text-muted">—</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDetail(p)}>Detail</button>
                    <ShowIfRole roles={['admin', 'panitia']}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    </ShowIfRole>
                    <ShowIfRole roles={['admin']}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Hapus</button>
                    </ShowIfRole>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Organizer">
        {selected && (
          <div>
            <div className="detail-grid">
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Nama Organisasi</label>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>{selected.organization_name}</p>
              </div>
              <div className="detail-item">
                <label>User Terkait</label>
                <p>{selected.user?.name ?? '—'}</p>
              </div>
              <div className="detail-item">
                <label>Email User</label>
                <p>{selected.user?.email ?? '—'}</p>
              </div>
              <div className="detail-item">
                <label>Nomor Telepon</label>
                <p>{selected.phone}</p>
              </div>
              <div className="detail-item">
                <label>Dibuat</label>
                <p>{new Date(selected.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Bio</label>
                <p>{selected.bio || <span style={{ color: 'var(--text-muted)' }}>Tidak ada bio.</span>}</p>
              </div>
            </div>
            <div className="modal-footer">
              <ShowIfRole roles={['admin', 'panitia']}>
                <button className="btn btn-outline" onClick={() => { setShowDetail(false); openEdit(selected) }}>Edit</button>
              </ShowIfRole>
              <button className="btn btn-ghost" onClick={() => setShowDetail(false)}>Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? 'Edit Organizer Profile' : 'Tambah Organizer Profile'}>
        {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
        <div className="form-group">
          <label className="form-label">User *</label>
          <select className="form-select" value={form.user_id}
            onChange={e => { setForm(f => ({ ...f, user_id: e.target.value })); setFormErrors(er => ({ ...er, user_id: '' })) }}
            disabled={!!selected}>
            <option value="">Pilih user...</option>
            {users
              .filter(u => !usedUserIds.has(u.id) || u.id === selected?.user_id)
              .map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)
            }
          </select>
          {formErrors.user_id && <p className="form-error">{formErrors.user_id}</p>}
          {selected && <p className="form-hint">User tidak dapat diubah saat edit.</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Nama Organisasi *</label>
          <input className="form-input" placeholder="Contoh: BEM FILKOM, UKM Robotika..." value={form.organization_name}
            onChange={e => { setForm(f => ({ ...f, organization_name: e.target.value })); setFormErrors(er => ({ ...er, organization_name: '' })) }} />
          {formErrors.organization_name && <p className="form-error">{formErrors.organization_name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Nomor Telepon *</label>
          <input className="form-input" placeholder="081234567890" value={form.phone}
            onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setFormErrors(er => ({ ...er, phone: '' })) }} />
          {formErrors.phone && <p className="form-error">{formErrors.phone}</p>}
          <p className="form-hint">Hanya angka, tanpa tanda hubung atau spasi.</p>
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" placeholder="Deskripsi singkat organisasi..."
            value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={saving}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Menyimpan...</> : 'Simpan'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}
