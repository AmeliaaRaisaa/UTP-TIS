import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session dari localStorage saat app load
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    // Mendukung format: { token, user } atau { access_token, user }
    const jwt      = res.data.token ?? res.data.access_token
    const userData = res.data.user  ?? res.data.data
    if (!jwt) throw new Error('Token tidak ditemukan dalam respons login.')
    // Simpan ke localStorage dulu sebelum set state,
    // supaya GuestRoute baca nilai terbaru saat re-render
    localStorage.setItem('token', jwt)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
    return userData
  }

  const register = async (name, email, password, password_confirmation, role) => {
    const res = await api.post('/auth/register', {
      name, email, password, password_confirmation, role
    })
    return res.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // tetap logout walau request gagal
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const refreshUser = async () => {
    try {
      // endpoint getUserProfile — bisa /auth/me atau /auth/user-profile
      const res = await api.get('/auth/me')
      const userData = res.data.user ?? res.data.data ?? res.data
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch {
      logout()
    }
  }

  // Helpers otorisasi
  const isAdmin   = () => user?.role === 'admin'
  const isPanitia = () => user?.role === 'panitia' || user?.role === 'admin'
  const hasRole   = (roles) => roles.includes(user?.role)

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, refreshUser,
      isAdmin, isPanitia, hasRole,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
