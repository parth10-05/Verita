import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // For cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Questions API calls
export const questionsAPI = {
  getQuestions: (params = {}) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (questionData) => api.post('/questions', questionData),
  updateQuestion: (id, questionData) => api.put(`/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  getUserQuestions: (userId) => api.get(`/questions/user/${userId}`),
  searchQuestions: (query) => api.get('/questions/search', { params: { q: query } }),
};

// Answers API calls
export const answersAPI = {
  getAnswers: (questionId) => api.get(`/questions/${questionId}/answers`),
  createAnswer: (questionId, answerData) => api.post(`/questions/${questionId}/answers`, answerData),
  updateAnswer: (answerId, answerData) => api.put(`/answers/${answerId}`, answerData),
  deleteAnswer: (answerId) => api.delete(`/answers/${answerId}`),
  acceptAnswer: (answerId) => api.post(`/answers/${answerId}/accept`),
  unacceptAnswer: (answerId) => api.post(`/answers/${answerId}/unaccept`),
};

// Votes API calls
export const votesAPI = {
  voteQuestion: (questionId, voteType) => api.post(`/questions/${questionId}/vote`, { voteType }),
  voteAnswer: (answerId, voteType) => api.post(`/answers/${answerId}/vote`, { voteType }),
  getQuestionVote: (questionId) => api.get(`/questions/${questionId}/vote`),
  getAnswerVote: (answerId) => api.get(`/answers/${answerId}/vote`),
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Tags API calls
export const tagsAPI = {
  getTags: () => api.get('/tags'),
  getPopularTags: () => api.get('/tags/popular'),
  createTag: (tagData) => api.post('/tags', tagData),
};

// Comments API calls
export const commentsAPI = {
  getQuestionComments: (questionId) => api.get(`/comments/questions/${questionId}`),
  getAnswerComments: (answerId) => api.get(`/comments/answers/${answerId}`),
  createComment: (data) => api.post('/comments', data),
  updateComment: (commentId, data) => api.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

// User API calls
export const userAPI = {
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userData) => api.put('/users/profile', userData),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  getUserQuestions: (userId, params = {}) => api.get(`/users/${userId}/questions`, { params }),
  getUserAnswers: (userId, params = {}) => api.get(`/users/${userId}/answers`, { params }),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  getAllQuestions: (params = {}) => api.get('/admin/questions', { params }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  deleteQuestion: (questionId) => api.delete(`/admin/questions/${questionId}`),
};

// Utility functions
export const apiUtils = {
  handleError: (error) => {
    if (error.response) {
      return error.response.data.message || 'An error occurred';
    }
    return error.message || 'Network error';
  },
  formatParams: (params) => {
    const formatted = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        formatted[key] = params[key];
      }
    });
    return formatted;
  },
};

export default api;