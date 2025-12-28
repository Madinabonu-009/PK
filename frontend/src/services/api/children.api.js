/**
 * Children API Service
 */
import api from '../api'

export const childrenAPI = {
  getAll: (params) => api.get('/children', { params }),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
  getProgress: (id) => api.get(`/children/${id}/progress`),
  getAttendance: (id, params) => api.get(`/children/${id}/attendance`, { params })
}

export default childrenAPI
