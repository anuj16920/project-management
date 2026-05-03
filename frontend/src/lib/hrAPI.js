import api from './api'

export const hrAPI = {
  // Stats
  stats:           ()             => api.get('/hr/stats'),

  // Departments
  listDepts:       ()             => api.get('/hr/departments'),
  createDept:      (data)         => api.post('/hr/departments', data),
  deleteDept:      (id)           => api.delete(`/hr/departments/${id}`),

  // Employees
  listEmployees:   (params)       => api.get('/hr/employees', { params }),
  getEmployee:     (id)           => api.get(`/hr/employees/${id}`),
  getMyProfile:    ()             => api.get('/hr/employees/me'),
  createEmployee:  (data)         => api.post('/hr/employees', data),
  updateEmployee:  (id, data)     => api.patch(`/hr/employees/${id}`, data),
  deleteEmployee:  (id)           => api.delete(`/hr/employees/${id}`),

  // Attendance
  clockIn:         ()             => api.post('/hr/attendance/clock-in'),
  clockOut:        ()             => api.post('/hr/attendance/clock-out'),
  getAttendance:   (params)       => api.get('/hr/attendance', { params }),
  markAttendance:  (data)         => api.post('/hr/attendance', data),

  // Leave Types
  listLeaveTypes:  ()             => api.get('/hr/leave-types'),
  createLeaveType: (data)         => api.post('/hr/leave-types', data),

  // Leave Requests
  listLeaves:      (params)       => api.get('/hr/leaves', { params }),
  applyLeave:      (data)         => api.post('/hr/leaves', data),
  reviewLeave:     (id, data)     => api.patch(`/hr/leaves/${id}/review`, data),
  cancelLeave:     (id)           => api.patch(`/hr/leaves/${id}/cancel`),

  // Payroll
  listPayroll:     (params)       => api.get('/hr/payroll', { params }),
  generatePayroll: (month, year)  => api.post('/hr/payroll/generate', { month, year }),
  processPayroll:  (id)           => api.patch(`/hr/payroll/${id}/process`),
  markPaid:        (id)           => api.patch(`/hr/payroll/${id}/paid`),
}