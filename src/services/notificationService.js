//File: frontend/src/services/notificationService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para incluir token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const notificationService = {
  // Obtener todas las notificaciones del usuario autenticado
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener notificaciones';
      throw new Error(message);
    }
  },

  // Obtener solo notificaciones no leídas
  getUnreadNotifications: async () => {
    try {
      const response = await api.get('/notifications/unread');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener notificaciones no leídas';
      throw new Error(message);
    }
  },

  // Marcar una notificación específica como leída
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al marcar notificación como leída';
      throw new Error(message);
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al marcar todas las notificaciones como leídas';
      throw new Error(message);
    }
  },

  // Obtener el conteo de notificaciones no leídas
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener conteo de notificaciones';
      throw new Error(message);
    }
  },
};

export default notificationService;