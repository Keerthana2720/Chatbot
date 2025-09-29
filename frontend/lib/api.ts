import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const chatAPI = {
  // Get chat history
  getHistory: (userId: string, limit = 50, offset = 0) =>
    api.get(`/chat/history/${userId}?limit=${limit}&offset=${offset}`),

  // Send message
  sendMessage: (message: string, userId: string, conversationId?: string) =>
    api.post('/chat/message', { message, userId, conversationId }),

  // Create conversation
  createConversation: (userId: string, title?: string) =>
    api.post('/chat/conversation', { userId, title }),

  // Get conversations
  getConversations: (userId: string, limit = 20, offset = 0) =>
    api.get(`/chat/conversations/${userId}?limit=${limit}&offset=${offset}`),

  // Delete conversation
  deleteConversation: (conversationId: string, userId: string) =>
    api.delete(`/chat/conversation/${conversationId}`, { data: { userId } }),
};

export const audioAPI = {
  // Transcribe audio
  transcribe: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    return api.post('/audio/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Synthesize speech
  synthesize: (text: string, voiceId?: string, userId?: string) =>
    api.post('/audio/synthesize', { text, voiceId, userId }, {
      responseType: 'blob',
    }),

  // Get voices
  getVoices: () => api.get('/audio/voices'),

  // Get audio history
  getHistory: (userId: string, limit = 20, offset = 0) =>
    api.get(`/audio/history/${userId}?limit=${limit}&offset=${offset}`),
};

export const authAPI = {
  // Login
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  // Register
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  // Get profile
  getProfile: () => api.get('/auth/profile'),

  // Update profile
  updateProfile: (data: { username?: string; email?: string }) =>
    api.put('/auth/profile', data),

  // Change password
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),

  // Delete account
  deleteAccount: () => api.delete('/auth/account'),
};

export default api;
