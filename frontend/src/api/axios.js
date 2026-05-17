import axios from 'axios'

const api = axios.create({
  // Pakai path relatif supaya request lewat proxy Vite → http://127.0.0.1:8000
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Kelompok': 'kelompok-6',
    'X-Category-Access': 'allowed',
  },
})

// Request interceptor — sisipkan JWT token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — tangani 401 (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
