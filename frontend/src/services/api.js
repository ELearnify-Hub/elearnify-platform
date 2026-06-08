 // services/api.js
// Central Axios configuration — all API calls go through here
// Think of this as your "remote control" for the backend

import axios from 'axios';

// ─── Server URL ──────────────────────────────────────────────────────────────
// Used for constructing image URLs and file paths from the server
export const SERVER_URL = 'http://localhost:5000';

// ─── Create Axios Instance ────────────────────────────────────────────────────
// Instead of typing the full URL every time, we set a base URL once
const API = axios.create({
  baseURL: `${SERVER_URL}/api`, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// This runs BEFORE every request is sent
// It automatically attaches the JWT token to every request
// So we don't have to manually add headers in every API call

API.interceptors.request.use(
  (config) => {
    // Get token from localStorage (we store it there after login)
    const token = localStorage.getItem('token');

    if (token) {
      // Attach token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// This runs AFTER every response is received
// If the server returns 401 (Unauthorized), the token has expired
// → Automatically log the user out

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Course API Calls ─────────────────────────────────────────────────────────
export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getById: (id) => API.get(`/courses/${id}`),

  // For file uploads we use FormData, not JSON
  // So we override Content-Type to let browser set multipart boundary
  create: (formData) => API.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => API.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => API.delete(`/courses/${id}`),
  uploadVideo: (id, formData) => API.post(`/courses/${id}/upload-video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadPDF: (id, formData) => API.post(`/courses/${id}/upload-pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  togglePublish: (id) => API.put(`/courses/${id}/publish`)
};

// ─── Enrollment API Calls ─────────────────────────────────────────────────────
export const enrollmentAPI = {
  enroll: (courseId) => API.post(`/enrollments/${courseId}`),
  unenroll: (courseId) => API.delete(`/enrollments/${courseId}`),
  getMyCourses: () => API.get('/enrollments/my-courses')
};

export const authAPI = {
  register:         (data)         => API.post('/auth/register', data),
  login:            (data)         => API.post('/auth/login',    data),
  getProfile:       ()             => API.get('/auth/profile'),
  getAllStudents:    ()             => API.get('/auth/students'),

  // ── Password Reset (NEW) ───────────────────────────────────
  forgotPassword:   (data)         => API.post('/auth/forgot-password',          data),
  verifyResetToken: (token)        => API.get(`/auth/verify-reset-token/${token}`),
  resetPassword:    (token, data)  => API.post(`/auth/reset-password/${token}`,  data)
};

// ─── Module & Lesson API ──────────────────────────────────────────────────────
export const moduleAPI = {
  // ── Modules ──────────────────────────────────────────────────────────────
  getModules:   (courseId) =>
    API.get(`/courses/${courseId}/modules`),

  addModule:    (courseId, data) =>
    API.post(`/courses/${courseId}/modules`, data),

  updateModule: (courseId, moduleId, data) =>
    API.put(`/courses/${courseId}/modules/${moduleId}`, data),

  deleteModule: (courseId, moduleId) =>
    API.delete(`/courses/${courseId}/modules/${moduleId}`),

  // ── Lessons ──────────────────────────────────────────────────────────────
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

  // ── Progress ──────────────────────────────────────────────────────────────
  markComplete: (courseId, lessonId, moduleId) =>
    API.post(`/courses/${courseId}/modules/progress`, { lessonId, moduleId })
};

// ─── Quiz API ─────────────────────────────────────────────────────────────────
export const quizAPI = {
  // Admin
  create:         (data)     => API.post('/quiz',                         data),
  update:         (id, data) => API.put(`/quiz/${id}`,                    data),
  delete:         (id)       => API.delete(`/quiz/${id}`),
  getAdminResults:(id)       => API.get(`/quiz/${id}/admin-results`),

  // Shared
  getByCourse:    (courseId) => API.get(`/quiz/course/${courseId}`),
  getById:        (id)       => API.get(`/quiz/${id}`),
  submit:         (id, data) => API.post(`/quiz/${id}/submit`,            data),
  getMyResults:   (id)       => API.get(`/quiz/${id}/results`)
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

export default API;
