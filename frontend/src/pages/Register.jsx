import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'peserta'
  })
  const [errors,  setErrors]  = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())      errs.name  = 'Nama wajib diisi.'
    if (!form.email.trim())     errs.email = 'Email wajib diisi.'
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter.'
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = 'Konfirmasi password tidak cocok.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation, form.role)
      setSuccess('Akun berhasil dibuat! Silakan login.')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        const mapped = {}
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setErrors(mapped)
      } else {
        setErrors({ general: data?.message || 'Registrasi gagal.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">🎪</div>
          <h1 className="auth-title">Buat Akun</h1>
          <p className="auth-subtitle">Daftar ke Sistem Manajemen Event Kampus</p>
        </div>

        {errors.general && <div className="alert alert-danger">{errors.general}</div>}
        {success        && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input name="name" type="text" className="form-input"
              placeholder="Nama kamu" value={form.name} onChange={handleChange} autoFocus />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input"
              placeholder="contoh@email.com" value={form.email} onChange={handleChange} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="peserta">Peserta</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
            <p className="form-hint">Pilih role sesuai kebutuhanmu dalam sistem event.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input"
              placeholder="Minimal 6 karakter" value={form.password} onChange={handleChange} />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Konfirmasi Password</label>
            <input name="password_confirmation" type="password" className="form-input"
              placeholder="Ulangi password" value={form.password_confirmation} onChange={handleChange} />
            {errors.password_confirmation && <p className="form-error">{errors.password_confirmation}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Mendaftar...
              </>
            ) : 'Daftar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link to="/login" className="link">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}
