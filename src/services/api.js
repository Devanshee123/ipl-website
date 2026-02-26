const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const api = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }
  
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }
  
  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }
    
    return data
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Backend server not running. Please start the backend server.')
    }
    throw error
  }
}

// Auth APIs
export const authAPI = {
  register: (userData) => api('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => api('/auth/login', { method: 'POST', body: credentials }),
  getProfile: () => api('/auth/profile'),
  updateProfile: (data) => api('/auth/profile', { method: 'PUT', body: data })
}

// Match APIs
export const matchAPI = {
  getAll: (filters = {}) => {
    const query = new URLSearchParams(filters).toString()
    return api(`/matches?${query}`)
  },
  getById: (id) => api(`/matches/${id}`),
  create: (data) => api('/matches', { method: 'POST', body: data }),
  update: (id, data) => api(`/matches/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/matches/${id}`, { method: 'DELETE' }),
  getSeats: (id) => api(`/matches/${id}/seats`)
}

// Booking APIs
export const bookingAPI = {
  create: (data) => api('/bookings', { method: 'POST', body: data }),
  getMyBookings: () => api('/bookings/my-bookings'),
  getAll: () => api('/bookings'),
  getById: (id) => api(`/bookings/${id}`),
  confirmPayment: (id, paymentData) => api(`/bookings/${id}/pay`, { method: 'PUT', body: paymentData }),
  cancel: (id) => api(`/bookings/${id}/cancel`, { method: 'PUT' })
}

// Payment APIs
export const paymentAPI = {
  initiateUPI: (data) => api('/payment/upi/initiate', { method: 'POST', body: data }),
  verify: (data) => api('/payment/verify', { method: 'POST', body: data }),
  getStatus: (transactionId) => api(`/payment/status/${transactionId}`)
}

// Admin APIs
export const adminAPI = {
  getStats: () => api('/admin/stats'),
  getUsers: () => api('/admin/users'),
  makeAdmin: (id) => api(`/admin/users/${id}/make-admin`, { method: 'PUT' }),
  getRecentBookings: () => api('/admin/recent-bookings'),
  updateMatchStatus: (id, status) => api(`/admin/matches/${id}/status`, { method: 'PUT', body: { status } })
}

// Settings APIs
export const settingsAPI = {
  getPaymentSettings: () => api('/settings/payment'),
  updatePaymentSettings: (data) => api('/settings/payment', { method: 'PUT', body: data })
}

export default api
