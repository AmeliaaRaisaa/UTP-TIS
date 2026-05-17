import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { ShowIfRole } from '../../components/ProtectedRoute'
import api from '../../api/axios'

const emptyForm = {
  category_id: '', title: '', location: '', event_date: '', capacity: '', status: 'draft'
}

const statusBadge = {
  published: 'badge-success',
  draft:     'badge-neutral',
  closed:    'badge-danger',
}

const statusLabel = { published: 'Tayang', draft: 'Draft', closed: 'Ditutup' }

export default function Events() {
  const [events,     setEvents]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')

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
      const [evRes, catRes] = await Promise.all([api.get('/events'), api.get('/categories')])
      setEvents(Array.isArray(evRes.data) ? evRes.data : evRes.data.data ?? [])
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.data ?? [])
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data event.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setSelected(null)
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? '' })
    setFormErrors({})
    setShowForm(true)
  }

  const openEdit = (ev) => {
    setSelected(ev)
    setForm({
      category_id: ev.category_id,
      title:       ev.title,
      location:    ev.location,
      event_date:  ev.event_date?.slice(0, 10),
      capacity:    ev.capacity,
      status:      ev.status,
    })
    setFormErrors({})
    setShowForm(true)
  }

  const openDetail = (ev) => { setSelected(ev); setShowDetail(true) }

  const validate = () => {
    const errs = {}
    if (!form.title.trim())      errs.title      = 'Judul wajib diisi.'
    if (!form.category_id)       errs.category_id = 'Pilih kategori.'
    if (!form.location.trim())   errs.location    = 'Lokasi wajib diisi.'
    if (!form.event_date)        errs.event_date  = 'Tanggal wajib diisi.'
    if (!form.capacity || form.capacity <= 0) errs.capacity = 'Kapasitas harus lebih dari 0.'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      if (selected) {
        await api.put(`/events/${selected.id}`, form)
        setAlert({ type: 'success', msg: 'Event berhasil diperbarui.' })
      } else {
        await api.post('/events', form)
        setAlert({ type: 'success', msg: 'Event berhasil ditambahkan.' })
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

  const handleDelete = async (ev) => {
    if (!window.confirm(`Hapus event "${ev.title}"?`)) return
    try {
      await api.delete(`/events/${ev.id}`)
      setAlert({ type: 'success', msg: 'Event berhasil dihapus.' })
      fetchData()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal menghapus event.' })
    }
  }

  const filtered = events.filter(ev => {
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? ev.status === filterStatus : true
    return matchSearch && matchStatus
  })

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Kampus</h1>
          <p className="page-subtitle">Daftar semua event yang tersedia</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M6.5 0a6.5 6.5 0 104.43 11.136l3.217 3.217a.75.75 0 001.06-1.06l-3.217-3.218A6.5 6.5 0 006.5 0zm-5 6.5a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <input type="text" placeholder="Cari event..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="published">Tayang</option>
            <option value="closed">Ditutup</option>
          </select>
          <ShowIfRole roles={['admin', 'organizer']}>
            <button className="btn btn-primary" onClick={openCreate}>
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              Tambah Event
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
              <th>Judul Event</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Tanggal</th>
              <th>Kapasitas</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-state-icon">🎪</div>
                  <p className="empty-state-title">Belum ada event</p>
                  <p className="empty-state-text">Tambahkan event baru sekarang.</p>
                </div>
              </td></tr>
            ) : filtered.map((ev, i) => (
              <tr key={ev.id}>
                <td className="text-muted text-xs">{i + 1}</td>
                <td>
                  <span className="td-main" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => openDetail(ev)}>
                    {ev.title}
                  </span>
                </td>
                <td><span className="badge badge-neutral">{ev.category?.name ?? '—'}</span></td>
                <td className="text-sm">{ev.location}</td>
                <td className="text-sm">{new Date(ev.event_date).toLocaleDateString('id-ID')}</td>
                <td><span className="badge badge-primary">{ev.capacity}</span></td>
                <td><span className={`badge ${statusBadge[ev.status] ?? 'badge-neutral'}`}>{statusLabel[ev.status] ?? ev.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDetail(ev)}>Detail</button>
                    <ShowIfRole roles={['admin', 'organizer']}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(ev)}>Edit</button>
                    </ShowIfRole>
                    <ShowIfRole roles={['admin']}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev)}>Hapus</button>
                    </ShowIfRole>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Event" size="lg">
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className={`badge ${statusBadge[selected.status]}`} style={{ fontSize: '0.8rem' }}>
                {statusLabel[selected.status]}
              </span>
              {selected.category && <span className="badge badge-neutral">{selected.category.name}</span>}
            </div>
            <div className="detail-grid">
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Judul Event</label>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>{selected.title}</p>
              </div>
              <div className="detail-item">
                <label>Lokasi</label>
                <p>{selected.location}</p>
              </div>
              <div className="detail-item">
                <label>Tanggal</label>
                <p>{new Date(selected.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="detail-item">
                <label>Kapasitas</label>
                <p>{selected.capacity} orang</p>
              </div>
              <div className="detail-item">
                <label>ID Event</label>
                <p className="text-muted">#{selected.id}</p>
              </div>
            </div>

            {selected.tags?.length > 0 && (
              <>
                <hr className="divider" />
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Tag</label>
                  <div className="tag-chips">
                    {selected.tags.map(t => (
                      <span key={t.id} className="tag-chip">
                        <span className="color-dot" style={{ background: t.color }} />
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="modal-footer">
              <ShowIfRole roles={['admin', 'organizer']}>
                <button className="btn btn-outline" onClick={() => { setShowDetail(false); openEdit(selected) }}>Edit</button>
              </ShowIfRole>
              <button className="btn btn-ghost" onClick={() => setShowDetail(false)}>Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? 'Edit Event' : 'Tambah Event'} size="lg">
        {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Judul Event *</label>
            <input className="form-input" placeholder="Judul event" value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setFormErrors(er => ({ ...er, title: '' })) }} />
            {formErrors.title && <p className="form-error">{formErrors.title}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Kategori *</label>
            <select className="form-select" value={form.category_id}
              onChange={e => { setForm(f => ({ ...f, category_id: e.target.value })); setFormErrors(er => ({ ...er, category_id: '' })) }}>
              <option value="">Pilih kategori...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {formErrors.category_id && <p className="form-error">{formErrors.category_id}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Tayang</option>
              <option value="closed">Ditutup</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Lokasi *</label>
            <input className="form-input" placeholder="Nama gedung / ruang" value={form.location}
              onChange={e => { setForm(f => ({ ...f, location: e.target.value })); setFormErrors(er => ({ ...er, location: '' })) }} />
            {formErrors.location && <p className="form-error">{formErrors.location}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Event *</label>
            <input className="form-input" type="date" value={form.event_date}
              onChange={e => { setForm(f => ({ ...f, event_date: e.target.value })); setFormErrors(er => ({ ...er, event_date: '' })) }} />
            {formErrors.event_date && <p className="form-error">{formErrors.event_date}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Kapasitas *</label>
            <input className="form-input" type="number" min="1" placeholder="Jumlah peserta" value={form.capacity}
              onChange={e => { setForm(f => ({ ...f, capacity: e.target.value })); setFormErrors(er => ({ ...er, capacity: '' })) }} />
            {formErrors.capacity && <p className="form-error">{formErrors.capacity}</p>}
          </div>
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
