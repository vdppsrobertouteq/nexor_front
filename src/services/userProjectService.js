// File: frontend/src/services/userProjectService.js
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

const userProjectService = {
  // Obtener proyectos del usuario autenticado
  getMyProjects: async () => {
    try {
      const response = await api.get('/user-projects');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener proyectos';
      throw new Error(message);
    }
  },
};

export default userProjectService;