import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';
const PREDICTION_API_URL = import.meta.env.VITE_PREDICTION_API_URL || 'http://localhost:5002';

// Auth API instance
export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prediction API instance
export const predictionApi = axios.create({
  baseURL: PREDICTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
const addAuthToken = (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addAuthToken);
predictionApi.interceptors.request.use(addAuthToken);

// Response interceptor for handling auth errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

predictionApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authService = {
  // Authentication
  register: (userData) => authApi.post('/api/auth/register', userData),
  login: (credentials) => authApi.post('/api/auth/login', credentials),
  logout: () => authApi.post('/api/auth/logout'),
  
  // User profile routes
  getCurrentUser: () => authApi.get('/api/auth/me'),
  getProfile: () => authApi.get('/api/auth/profile'),
  updateProfile: (profileData) => authApi.put('/api/auth/profile/update', profileData),
  changePassword: (passwordData) => authApi.put('/api/auth/change-password', passwordData),
  
  // OAuth Google
  googleAuth: () => {
    window.open(`${AUTH_API_URL}/api/auth/google`, 'google_auth', 'width=500,height=600');
  }
};

// Prediction API methods
export const predictionService = {
  predictSingle: (playerData) => predictionApi.post('/api/predict/single', playerData),
  predictBatch: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return predictionApi.post('/api/predict/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getRecommendations: (playerData, prediction) => 
    predictionApi.post('/api/predict/recommendations', { player_data: playerData, prediction }),
  healthCheck: () => predictionApi.get('/api/predict/health')
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};