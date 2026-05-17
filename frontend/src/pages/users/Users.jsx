import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { RoleRoute, ShowIfRole } from '../../components/ProtectedRoute'
import api from '../../api/axios'

const emptyForm = { name: '', email: '', password: '', role: 'peserta' }

const roleColor = { admin: 'badge-primary', organizer: 'badge-success', peserta: 'badge-neutral' }

export default function Users() {
  return (
    <RoleRoute roles={['admin']}>
      <UsersContent />
    </RoleRoute>
  )
}

function UsersContent() {
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

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(Array.isArray(res.data) ? res.data : res.data.data ?? [])
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data user.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => {
    setSelected(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowForm(true)
  }

  const openEdit = (u) => {
    setSelected(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setFormErrors({})
    setShowForm(true)
  }

  const openDetail = (u) => { setSelected(u); setShowDetail(true) }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Nama wajib diisi.'
    if (!form.email.trim()) errs.email = 'Email wajib diisi.'
    if (!selected && form.password.length < 6) errs.password = 'Password minimal 6 karakter.'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email, role: form.role }
      if (form.password) payload.password = form.password

      if (selected) {
        await api.put(`/users/${selected.id}`, payload)
        setAlert({ type: 'success', msg: 'User berhasil diperbarui.' })
      } else {
        payload.password = form.password
        await api.post('/users', payload)
        setAlert({ type: 'success', msg: 'User berhasil ditambahkan.' })
      }
      setShowForm(false)
      fetchUsers()
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

  const handleDelete = async (u) => {
    if (!window.confirm(`Hapus user "${u.name}"?`)) return
    try {
      await api.delete(`/users/${u.id}`)
      setAlert({ type: 'success', msg: 'User berhasil dihapus.' })
      fetchUsers()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal menghapus user.' })
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen User</h1>
          <p className="page-subtitle">Kelola akun pengguna sistem — hanya admin</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M6.5 0a6.5 6.5 0 104.43 11.136l3.217 3.217a.75.75 0 001.06-1.06l-3.217-3.218A6.5 6.5 0 006.5 0zm-5 6.5a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <input type="text" placeholder="Cari nama / email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            Tambah User
          </button>
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
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organizer Profile</th>
              <th>Terdaftar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <p className="empty-state-title">Belum ada user</p>
                </div>
              </td></tr>
            ) : filtered.map((u, i) => (
              <tr key={u.id}>
                <td className="text-muted text-xs">{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="td-main" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => openDetail(u)}>
                      {u.name}
                    </span>
                  </div>
                </td>
                <td className="text-sm">{u.email}</td>
                <td><span className={`badge ${roleColor[u.role] ?? 'badge-neutral'}`}>{u.role}</span></td>
                <td>
                  {u.organizer_profile
                    ? <span className="badge badge-success">Ada</span>
                    : <span className="badge badge-neutral">Belum ada</span>}
                </td>
                <td className="text-muted text-xs">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDetail(u)}>Detail</button>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail User">
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: 'white',
              }}>
                {selected.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>{selected.name}</div>
                <span className={`badge ${roleColor[selected.role] ?? 'badge-neutral'}`}>{selected.role}</span>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Email</label>
                <p>{selected.email}</p>
              </div>
              <div className="detail-item">
                <label>Terdaftar</label>
                <p>{new Date(selected.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="detail-item">
                <label>Organizer Profile</label>
                <p>{selected.organizer_profile?.organization_name ?? <span style={{ color: 'var(--text-muted)' }}>Belum dibuat</span>}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setShowDetail(false); openEdit(selected) }}>Edit</button>
              <button className="btn btn-ghost" onClick={() => setShowDetail(false)}>Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? 'Edit User' : 'Tambah User'}>
        {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
        <div className="form-group">
          <label className="form-label">Nama Lengkap *</label>
          <input className="form-input" placeholder="Nama user" value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(er => ({ ...er, name: '' })) }} />
          {formErrors.name && <p className="form-error">{formErrors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" placeholder="email@contoh.com" value={form.email}
            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFormErrors(er => ({ ...er, email: '' })) }} />
          {formErrors.email && <p className="form-error">{formErrors.email}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="peserta">Peserta</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{selected ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
          <input className="form-input" type="password" placeholder="Minimal 6 karakter" value={form.password}
            onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setFormErrors(er => ({ ...er, password: '' })) }} />
          {formErrors.password && <p className="form-error">{formErrors.password}</p>}
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
