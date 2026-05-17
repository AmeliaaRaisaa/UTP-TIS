import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { ShowIfRole } from '../../components/ProtectedRoute'
import api from '../../api/axios'

const emptyForm = { name: '', color: '#7b6fff' }

export default function Tags() {
  const [tags,     setTags]     = useState([])
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  const [showForm,        setShowForm]        = useState(false)
  const [showDetail,      setShowDetail]      = useState(false)
  const [showAttachModal, setShowAttachModal] = useState(false)
  const [selected,        setSelected]        = useState(null)
  const [form,            setForm]            = useState(emptyForm)
  const [formErrors,      setFormErrors]      = useState({})
  const [saving,          setSaving]          = useState(false)
  const [alert,           setAlert]           = useState(null)

  const [attachEventId, setAttachEventId] = useState('')
  const [attaching,     setAttaching]     = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tRes, eRes] = await Promise.all([api.get('/tags'), api.get('/events')])
      setTags(Array.isArray(tRes.data) ? tRes.data : tRes.data.data ?? [])
      setEvents(Array.isArray(eRes.data) ? eRes.data : eRes.data.data ?? [])
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data tag.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => { setSelected(null); setForm(emptyForm); setFormErrors({}); setShowForm(true) }
  const openEdit   = (t)  => { setSelected(t); setForm({ name: t.name, color: t.color }); setFormErrors({}); setShowForm(true) }
  const openDetail = (t)  => { setSelected(t); setShowDetail(true) }
  const openAttach = (t)  => { setSelected(t); setAttachEventId(''); setShowAttachModal(true) }

  const validateColor = (c) => /^#[A-Fa-f0-9]{6}$/.test(c)

  const handleSave = async () => {
    const errs = {}
    if (!form.name.trim())          errs.name  = 'Nama tag wajib diisi.'
    if (!validateColor(form.color)) errs.color = 'Format warna harus hex, contoh: #FF5733'
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      if (selected) {
        await api.put(`/tags/${selected.id}`, form)
        setAlert({ type: 'success', msg: 'Tag berhasil diperbarui.' })
      } else {
        await api.post('/tags', form)
        setAlert({ type: 'success', msg: 'Tag berhasil ditambahkan.' })
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

  const handleDelete = async (t) => {
    if (!window.confirm(`Hapus tag "${t.name}"?`)) return
    try {
      await api.delete(`/tags/${t.id}`)
      setAlert({ type: 'success', msg: 'Tag berhasil dihapus.' })
      fetchData()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal menghapus tag.' })
    }
  }

  const handleAttach = async () => {
    if (!attachEventId) return
    setAttaching(true)
    try {
      await api.put(`/events/${attachEventId}/tags/${selected.id}`)
      setAlert({ type: 'success', msg: `Tag "${selected.name}" berhasil ditambahkan ke event.` })
      setShowAttachModal(false)
      fetchData()
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal menghubungkan tag ke event.' })
    } finally {
      setAttaching(false)
    }
  }

  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Tag</h1>
          <p className="page-subtitle">Kelola tag dan hubungkan ke event</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M6.5 0a6.5 6.5 0 104.43 11.136l3.217 3.217a.75.75 0 001.06-1.06l-3.217-3.218A6.5 6.5 0 006.5 0zm-5 6.5a5 5 0 1110 0 5 5 0 01-10 0z" />
              </svg>
            </span>
            <input type="text" placeholder="Cari tag..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <ShowIfRole roles={['admin', 'organizer']}>
            <button className="btn btn-primary" onClick={openCreate}>
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              Tambah Tag
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

      {/* Tag cards grid */}
      {loading ? (
        <div className="loading-center"><span className="loading-spinner" /><span>Memuat...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <p className="empty-state-title">Belum ada tag</p>
          <p className="empty-state-text">Tambahkan tag untuk event kamu.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {filtered.map(tag => (
            <div key={tag.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: tag.color + '30',
                  border: `2px solid ${tag.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span className="color-dot" style={{ background: tag.color, width: 14, height: 14 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{tag.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tag.color}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                {tag.events?.length ?? 0} event menggunakan tag ini
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openDetail(tag)}>Detail</button>
                <ShowIfRole roles={['admin', 'organizer']}>
                  <button className="btn btn-success btn-sm" onClick={() => openAttach(tag)}>+ Event</button>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(tag)}>Edit</button>
                </ShowIfRole>
                <ShowIfRole roles={['admin']}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tag)}>Hapus</button>
                </ShowIfRole>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Tag">
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: selected.color + '25',
                border: `2px solid ${selected.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="color-dot" style={{ background: selected.color, width: 22, height: 22 }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700 }}>{selected.name}</div>
                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{selected.color}</div>
              </div>
            </div>

            {selected.events?.length > 0 && (
              <>
                <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Event dengan tag ini ({selected.events.length})
                </p>
                <div className="tag-chips">
                  {selected.events.map(ev => (
                    <span key={ev.id} className="tag-chip">{ev.title}</span>
                  ))}
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
      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? 'Edit Tag' : 'Tambah Tag'}>
        {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
        <div className="form-group">
          <label className="form-label">Nama Tag *</label>
          <input className="form-input" placeholder="Contoh: Teknologi, Gratis..." value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(er => ({ ...er, name: '' })) }} />
          {formErrors.name && <p className="form-error">{formErrors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Warna (Hex) *</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="color" value={form.color}
              onChange={e => { setForm(f => ({ ...f, color: e.target.value })); setFormErrors(er => ({ ...er, color: '' })) }}
              style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }} />
            <input className="form-input" placeholder="#FF5733" value={form.color}
              onChange={e => { setForm(f => ({ ...f, color: e.target.value })); setFormErrors(er => ({ ...er, color: '' })) }}
              style={{ fontFamily: 'monospace' }} />
          </div>
          {formErrors.color && <p className="form-error">{formErrors.color}</p>}
          <p className="form-hint">Format: #RRGGBB — gunakan color picker atau tulis manual.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={saving}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Menyimpan...</> : 'Simpan'}
          </button>
        </div>
      </Modal>

      {/* Attach to Event Modal */}
      <Modal open={showAttachModal} onClose={() => setShowAttachModal(false)} title={`Tambahkan Tag ke Event`}>
        {selected && (
          <div>
            <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Tag: <strong style={{ color: 'var(--text-primary)' }}>{selected.name}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Pilih Event *</label>
              <select className="form-select" value={attachEventId} onChange={e => setAttachEventId(e.target.value)}>
                <option value="">Pilih event...</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAttachModal(false)} disabled={attaching}>Batal</button>
              <button className="btn btn-success" onClick={handleAttach} disabled={attaching || !attachEventId}>
                {attaching ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Menghubungkan...</> : 'Tambahkan'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
