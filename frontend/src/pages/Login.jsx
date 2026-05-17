import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppLogo from '../components/AppLogo'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  // Tentukan halaman tujuan berdasarkan role
  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':   return '/dashboard'
      case 'panitia': return '/dashboard'
      case 'peserta': return '/events'
      default:        return '/dashboard'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi.')
      return
    }
    setLoading(true)
    try {
      const userData = await login(form.email, form.password)
      navigate(getRedirectPath(userData?.role), { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa email dan password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'none', boxShadow: 'none', padding: 0 }}>
            <AppLogo size={56} />
          </div>
          <h1 className="auth-title">Masuk</h1>
          <p className="auth-subtitle">Sistem Manajemen Event Kampus</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="contoh@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Password kamu"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading
              ? <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Memproses...</>
              : 'Masuk'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link to="/register" className="link">Daftar</Link>
        </p>
      </div>
    </div>
  )
}
