// API Configuration for React + Vite + TypeScript
import axios from 'axios';

// API Base URL - adjust if your backend runs on different port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if you need cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle specific error types
    if (error.code === 'ERR_BLOCKED_BY_CLIENT') {
      console.error('Request blocked by browser/ad-blocker. Please disable ad blockers for localhost.');
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error. Check if backend is running on', API_BASE_URL);
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  // Test connection
  test: () => api.get('/test'),
  
  // Authentication
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  
  register: (username: string, password: string, role: string) =>
    api.post('/auth/register', { username, password, role }),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
};

export const certificateAPI = {
  // Certificate management
  addCertificate: (data: {
    student_name: string;
    degree: string;
    issue_date: string;
    certificate_id: string;
  }) => api.post('/add_certificate', data),
  
  deleteCertificate: (certificateId: string) =>
    api.delete(`/delete_certificate/${certificateId}`),
  
  verifyCertificate: (certificateId: string) =>
    api.get(`/verify/${certificateId}`),
  
  verifyPublic: (certificateId: string) =>
    api.get(`/verify/simple/${certificateId}`),
  
  liveVerifyCertificate: (certificateId: string) =>
    api.get(`/verify/live/${certificateId}`),
  
  getAllCertificates: () => api.get('/certificates'),
  
  searchCertificates: (params: {
    q?: string;
    degree?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/search', { params }),
  
  // Debug certificate
  debugCertificate: (certificateId: string) =>
    api.get(`/debug/certificate/${certificateId}`),
};

// Blockchain API
export const blockchainAPI = {
  getBlockchain: () => api.get('/chain'),
  validateBlockchain: () => api.get('/chain/validate'),
};

export const systemAPI = {
  // System information
  getHealth: () => api.get('/health'),
  
  getDashboard: () => api.get('/dashboard'),
  
  getStats: () => api.get('/stats'),
  
  getLiveAnalytics: () => api.get('/analytics/live'),
  
  getNotifications: () => api.get('/notifications'),
  
  getBlockchain: () => api.get('/chain'),
  
  validateBlockchain: () => api.get('/chain/validate'),
};

// Connection test utility
export const testConnection = async (): Promise<boolean> => {
  try {
    await api.get('/test');
    console.log('✅ Backend connection successful');
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Error handler utility
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    console.error(`API Error ${status}:`, data.message || data.error);
    return data.message || `Server error: ${status}`;
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.message);
    if (error.code === 'ERR_BLOCKED_BY_CLIENT') {
      return 'Request blocked by browser or ad-blocker. Please disable ad-blockers for localhost.';
    }
    return 'Network error. Please check if the backend server is running.';
  } else {
    // Other error
    console.error('Error:', error.message);
    return error.message;
  }
};

export default api;
