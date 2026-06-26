import api from './axios'

export const authService = {
  login:           (email, password) => api.post('/auth/login', { email, password }),
  registerPatient: (data)            => api.post('/auth/register/patient', data),
  registerDoctor:  (data)            => api.post('/auth/register/doctor', data),
  changePassword:  (data)            => api.put('/auth/change-password', data),
  resetPassword:   (data)            => api.post('/auth/reset-password', data)
}

export const appointmentService = {
  // Patient
  getAll:          ()             => api.get('/appointments'),
  create:          (data)         => api.post('/appointments', data),
  cancel:          (id, data)     => api.put(`/appointments/${id}/cancel`, data),
  reschedule:      (id, data)     => api.put(`/appointments/${id}/reschedule`, data),
  // Doctor actions on a specific appointment
  confirm:         (id)           => api.put(`/appointments/${id}/confirm`),
  complete:        (id)           => api.put(`/appointments/${id}/complete`),
  cancelByDoctor:  (id, data)     => api.put(`/appointments/${id}/cancel-doctor`, data),
  // Doctor calendar - separate path to avoid /{id} conflict
  getDoctorToday:  ()             => api.get('/doctor/appointments/today'),
  getDoctorPending:()             => api.get('/doctor/appointments/pending'),
  getDoctorWeek:   (from, to)     => api.get(`/doctor/appointments/week?from=${from}&to=${to}`),
  // Public
  getSlots:        (doctorId, date) => api.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`)
}

export const medicalRecordService = {
  create:       (data)      => api.post('/medical-records', data),
  getByPatient: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  myRecords:    ()          => api.get('/medical-records/my-records')
}

export const disabilityService = {
  create:         (data)      => api.post('/disabilities', data),
  getByPatient:   (patientId) => api.get(`/disabilities/patient/${patientId}`),
  myDisabilities: ()          => api.get('/disabilities/my-disabilities')
}

export const chatService = {
  send:            (data)    => api.post('/chat/send', data),
  getConversation: (otherId) => api.get(`/chat/conversation/${otherId}`),
  getContacts:     ()        => api.get('/chat/contacts')
}

export const userService = {
  getProfile:          ()     => api.get('/users/profile'),
  updatePatientProfile:(data) => api.put('/users/profile/patient', data),
  updateDoctorProfile: (data) => api.put('/users/profile/doctor', data),
  getPatients:         ()     => api.get('/users/patients'),
  getDoctors:          ()     => api.get('/users/doctors')
}

export const notificationService = {
  getAll:      () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all')
}
