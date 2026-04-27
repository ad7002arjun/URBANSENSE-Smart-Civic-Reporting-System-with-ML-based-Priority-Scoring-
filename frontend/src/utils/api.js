import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('urbansense_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('urbansense_token');
            localStorage.removeItem('urbansense_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ AUTH API ============
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// ============ COMPLAINTS API ============
export const complaintsAPI = {
    create: (formData) =>
        api.post('/complaints', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getAll: (params) => api.get('/complaints', { params }),
    getById: (id) => api.get(`/complaints/${id}`),
    getMy: () => api.get('/complaints/my'),
    updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
    upvote: (id) => api.put(`/complaints/${id}/upvote`),
};

// ============ DASHBOARD API ============
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getComplaints: (params) => api.get('/dashboard/complaints', { params }),
    recalculate: () => api.post('/dashboard/recalculate'),
    getComparison: () => api.get('/dashboard/comparison'),
};

export default api;