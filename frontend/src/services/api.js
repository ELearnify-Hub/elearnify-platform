// services/api.js
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Robust API URL handling
//
// Local development fallback:
//   http://localhost:5000/api
//
// Vercel production fallback:
//   https://elearning-backend-76wm.onrender.com/api
//
// Vercel env should still be:
//   VITE_SERVER_URL=https://elearning-backend-76wm.onrender.com/api
//
// This file also protects you if VITE_SERVER_URL is missing on Vercel.
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTION_BACKEND_URL = 'https://elearning-backend-76wm.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:5000';

const isBrowser = typeof window !== 'undefined';
const isProductionHost =
  isBrowser &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

const rawServerUrl =
  import.meta.env.VITE_SERVER_URL ||
  (isProductionHost ? PRODUCTION_BACKEND_URL : LOCAL_BACKEND_URL);

const normalizeApiBaseUrl = (url) => {
  const cleanUrl = String(url || '').replace(/\/+$/, '');

  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }

  return `${cleanUrl}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(rawServerUrl);
export const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not redirect for every 401 here.
    // Some admin dashboard requests can fail individually while public courses
    // should still load. Let pages/components decide what to do.
    return Promise.reject(error);
  }
);

export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getById: (id) => API.get(`/courses/${id}`),

  create: (formData) =>
    API.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  update: (id, formData) =>
    API.put(`/courses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  delete: (id) => API.delete(`/courses/${id}`),

  uploadVideo: (id, formData) =>
    API.post(`/courses/${id}/upload-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  uploadPDF: (id, formData) =>
    API.post(`/courses/${id}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  togglePublish: (id) => API.put(`/courses/${id}/publish`)
};

export const enrollmentAPI = {
  enroll: (courseId) => API.post(`/enrollments/${courseId}`),
  unenroll: (courseId) => API.delete(`/enrollments/${courseId}`),
  getMyCourses: () => API.get('/enrollments/my-courses')
};

export const authAPI = {
  register:         (data)  => API.post('/auth/register', data),
  login:            (data)  => API.post('/auth/login',    data),
  getProfile:       ()      => API.get('/auth/profile'),
  getAllStudents:    ()      => API.get('/auth/students'),
  forgotPassword:   (data)  => API.post('/auth/forgot-password',        data),
  verifyResetToken: (token) => API.get(`/auth/verify-reset-token/${token}`),
  resetPassword:    (token, data) => API.post(`/auth/reset-password/${token}`, data),
  getStats:         ()      => API.get('/auth/stats'),
  changePassword:   (data)  => API.put('/auth/change-password', data),
  updateProfile:    (formData) => API.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const moduleAPI = {
  getModules: (courseId) =>
    API.get(`/courses/${courseId}/modules`),

  addModule: (courseId, data) =>
    API.post(`/courses/${courseId}/modules`, data),

  updateModule: (courseId, moduleId, data) =>
    API.put(`/courses/${courseId}/modules/${moduleId}`, data),

  deleteModule: (courseId, moduleId) =>
    API.delete(`/courses/${courseId}/modules/${moduleId}`),

  addLesson: (courseId, moduleId, formData) =>
    API.post(
      `/courses/${courseId}/modules/${moduleId}/lessons`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  updateLesson: (courseId, moduleId, lessonId, formData) =>
    API.put(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  deleteLesson: (courseId, moduleId, lessonId) =>
    API.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),

  markComplete: (courseId, lessonId, moduleId) =>
    API.post(`/courses/${courseId}/modules/progress`, {
      lessonId,
      moduleId
    })
};

export const quizAPI = {
  create: (data) => API.post('/quiz', data),
  update: (id, data) => API.put(`/quiz/${id}`, data),
  delete: (id) => API.delete(`/quiz/${id}`),
  getAdminResults: (id) => API.get(`/quiz/${id}/admin-results`),

  getByCourse: (courseId) => API.get(`/quiz/course/${courseId}`),
  getById: (id) => API.get(`/quiz/${id}`),
  submit: (id, data) => API.post(`/quiz/${id}/submit`, data),
  getMyResults: (id) => API.get(`/quiz/${id}/results`)
};

export const certificateAPI = {
  getMyForCourse: (courseId) =>
    API.get(`/certificates/course/${courseId}/my`),

  downloadFile: (certificateId) =>
    API.get(`/certificates/download/${certificateId}`, {
      responseType: 'blob'
    }),

  verify: (certificateId) =>
    API.get(`/certificates/verify/${certificateId}`),

  getAll: () =>
    API.get('/certificates/admin/all')
};

export const instructorAPI = {
  getDashboard: () => API.get('/instructor/dashboard'),
  getMyCourses: () => API.get('/instructor/my-courses'),
  getMyStudents: () => API.get('/instructor/students'),
  updateProfile: (data) => API.put('/instructor/profile', data),

  getAll: () => API.get('/instructor'),
  toggleApproval: (id) => API.put(`/instructor/${id}/approve`),
  changeRole: (id, data) => API.put(`/instructor/${id}/role`, data)
};

export const twoFactorAPI = {
  getStatus:            ()       => API.get('/2fa/status'),
  setup:                ()       => API.post('/2fa/setup'),
  verifySetup:          (data)   => API.post('/2fa/verify-setup',            data),
  disable:              (data)   => API.delete('/2fa/disable',               { data }),
  verifyLogin:          (data)   => API.post('/2fa/verify-login',            data),
  regenerateBackupCodes:(data)   => API.post('/2fa/regenerate-backup-codes', data)
};

export const reviewAPI = {
  get:       (courseId)       => API.get(`/reviews/${courseId}`),
  getMyReview:(courseId)      => API.get(`/reviews/${courseId}/my-review`),
  create:    (courseId, data) => API.post(`/reviews/${courseId}`,   data),
  delete:    (courseId)       => API.delete(`/reviews/${courseId}`)
};

export const notificationAPI = {
  getAll:      ()   => API.get('/notifications'),
  markAllRead: ()   => API.put('/notifications/read-all'),
  markOneRead: (id) => API.put(`/notifications/${id}/read`),
  clearAll:    ()   => API.delete('/notifications')
};


export const aiAPI = {
  ask: (data) => API.post('/ai/ask', data),
  recommendations: () => API.get('/ai/recommendations'),
  history: () => API.get('/ai/history'),
  quizIdeas: (data) => API.post('/ai/quiz-ideas', data)
};

export const liveClassAPI = {
  getAll: (params) => API.get('/live-classes', { params }),
  getById: (id) => API.get(`/live-classes/${id}`),
  create: (data) => API.post('/live-classes', data),
  update: (id, data) => API.put(`/live-classes/${id}`, data),
  updateStatus: (id, status) => API.patch(`/live-classes/${id}/status`, { status }),
  delete: (id) => API.delete(`/live-classes/${id}`)
};

export const contactAPI = {
  send: (data) => API.post('/contact', data),
  getAll: () => API.get('/contact'),
  updateStatus: (id, status) => API.patch(`/contact/${id}/status`, { status })
};

export const getLiveClasses = async (params) => {
  const response = await liveClassAPI.getAll(params);
  return response.data;
};

export const getLiveClassById = async (id) => {
  const response = await liveClassAPI.getById(id);
  return response.data;
};

export const createLiveClass = async (liveClassData) => {
  const response = await liveClassAPI.create(liveClassData);
  return response.data;
};

export const updateLiveClass = async (id, liveClassData) => {
  const response = await liveClassAPI.update(id, liveClassData);
  return response.data;
};

export const updateLiveClassStatus = async (id, status) => {
  const response = await liveClassAPI.updateStatus(id, status);
  return response.data;
};

export const deleteLiveClass = async (id) => {
  const response = await liveClassAPI.delete(id);
  return response.data;
};

export const sendContactMessage = async (messageData) => {
  const response = await contactAPI.send(messageData);
  return response.data;
};

export default API;
