// File: frontend/src/services/userService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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

const userService = {
  // Obtener todos los usuarios con paginación y filtros
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      const cleanFilters = (filters) => {
        const cleaned = {};
        if (filters.search) cleaned.search = filters.search;
        if (typeof filters.rol === 'number') cleaned.rol = filters.rol;
        if (typeof filters.activo === 'boolean') cleaned.activo = filters.activo;
        return cleaned;
      };

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...cleanFilters(filters)
      });


      const response = await api.get(`/users?${params}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener usuarios';
      throw new Error(message);
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener usuario';
      throw new Error(message);
    }
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al crear usuario';
      throw new Error(message);
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar usuario';
      throw new Error(message);
    }
  },

  // Eliminar usuario (soft delete)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar usuario';
      throw new Error(message);
    }
  },

  // Activar/desactivar usuario
  toggleUserStatus: async (id, activo) => {
    try {
      const response = await api.patch(`/users/${id}/status`, { activo });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cambiar estado del usuario';
      throw new Error(message);
    }
  },

  // Obtener todos los roles disponibles
  getRoles: async () => {
    try {
      const response = await api.get('/users/roles');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener roles';
      throw new Error(message);
    }
  },

  // Cambiar contraseña de usuario
  changeUserPassword: async (id, newPassword) => {
    try {
      const response = await api.patch(`/users/${id}/password`, { newPassword });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cambiar contraseña';
      throw new Error(message);
    }
  }
};

export default userService;