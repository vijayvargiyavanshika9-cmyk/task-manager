import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Automatically sends and receives httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Project Service Endpoints
export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Task Service Endpoints
export const taskAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  search: (projectId, params) => api.get(`/projects/${projectId}/tasks/search`, { params }),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, { status, order }) => api.patch(`/tasks/${id}/status`, { status, order }),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};

export default api;
