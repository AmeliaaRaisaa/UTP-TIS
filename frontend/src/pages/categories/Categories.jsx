import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { ShowIfRole } from '../../components/ProtectedRoute'
import api from '../../api/axios'

const emptyForm = { name: '', description: '' }

export default function Categories() {
  const { isAdmin, isPanitia } = useAuth()

  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')

  const [showForm,   setShowForm]   = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [form,       setForm]       = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)
  const [alert,      setAlert]      = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await api.get('/categories')
      setCategories(Array.isArray(res.data) ? res.data : res.data.data ?? [])
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data kategori.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setSelected(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setSelected(cat)
    setForm({ name: cat.name, description: cat.description ?? '' })
    setFormErrors({})
    setShowForm(true)
  }

  const openDetail = (cat) => {
    setSelected(cat)
    setShowDetail(true)
  }

  const handleSave = async () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Nama kategori wajib diisi.'
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      if (selected) {
        await api.put(`/categories/${selected.id}`, form)
        setAlert({ type: 'success', msg: 'Kategori berhasil diperbarui.' })
      } else {
        await api.post('/categories', form)
        setAlert({ type: 'success', msg: 'Kategori berhasil ditambahkan.' })
      }
      setShowForm(false)
      fetchCategories()
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

  const handleDelete = async (cat) => {
    if (!window.confirm(`Hapus kategori "${cat.name}"? Semua event dalam kategori ini juga terhapus.`)) return
    try {
      await api.delete(`/categories/${cat.id}`)
      setAlert({ type: 'success', msg: 'Kategori berhasil dihapus.' })
      fetchCategories()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal menghapus kategori.' })
    }
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori Event</h1>
          <p className="page-subtitle">Kelola kategori untuk pengelompokan event</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M6.5 0a6.5 6.5 0 104.43 11.136l3.217 3.217a.75.75 0 001.06-1.06l-3.217-3.218A6.5 6.5 0 006.5 0zm-5 6.5a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ShowIfRole roles={['admin', 'panitia']}>
            <button className="btn btn-primary" onClick={openCreate}>
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              Tambah Kategori
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
              <th>Nama Kategori</th>
              <th>Deskripsi</th>
              <th>Jumlah Event</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">🗂️</div>
                  <p className="empty-state-title">Belum ada kategori</p>
                  <p className="empty-state-text">Tambahkan kategori pertama kamu.</p>
                </div>
              </td></tr>
            ) : filtered.map((cat, i) => (
              <tr key={cat.id}>
                <td className="text-muted text-xs">{i + 1}</td>
                <td>
                  <span className="td-main" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => openDetail(cat)}>
                    {cat.name}
                  </span>
                </td>
                <td className="truncate" style={{ maxWidth: 250 }}>{cat.description || <span className="text-muted">—</span>}</td>
                <td>
                  <span className="badge badge-primary">{cat.events?.length ?? 0} event</span>
                </td>
                <td className="text-muted text-xs">{new Date(cat.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDetail(cat)}>Detail</button>
                    <ShowIfRole roles={['admin', 'panitia']}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                    </ShowIfRole>
                    <ShowIfRole roles={['admin']}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)}>Hapus</button>
                    </ShowIfRole>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Kategori">
        {selected && (
          <div>
            <div className="detail-grid">
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Nama Kategori</label>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>{selected.name}</p>
              </div>
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Deskripsi</label>
                <p>{selected.description || <span style={{ color: 'var(--text-muted)' }}>Tidak ada deskripsi.</span>}</p>
              </div>
              <div className="detail-item">
                <label>Dibuat</label>
                <p>{new Date(selected.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="detail-item">
                <label>Diperbarui</label>
                <p>{new Date(selected.updated_at).toLocaleString('id-ID')}</p>
              </div>
            </div>

            {selected.events?.length > 0 && (
              <>
                <hr className="divider" />
                <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
                  Event dalam kategori ini ({selected.events.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.events.map(ev => (
                    <div key={ev.id} style={{
                      padding: '8px 12px',
                      background: 'var(--bg-hover)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              </>
            )}

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
      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? 'Edit Kategori' : 'Tambah Kategori'}>
        {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
        <div className="form-group">
          <label className="form-label">Nama Kategori *</label>
          <input
            className="form-input"
            placeholder="Contoh: Seminar, Workshop..."
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(er => ({ ...er, name: '' })) }}
          />
          {formErrors.name && <p className="form-error">{formErrors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea
            className="form-textarea"
            placeholder="Deskripsi singkat kategori ini..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
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
