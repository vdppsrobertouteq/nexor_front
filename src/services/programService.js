//File: frontend/src/services/programService.js
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

const programService = {
  // Obtener todos los programas con paginación y filtros
  getPrograms: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await api.get(`/programs?${params}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener programas';
      throw new Error(message);
    }
  },

  // Obtener programa por ID
  getProgramById: async (id) => {
    try {
      const response = await api.get(`/programs/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener programa';
      throw new Error(message);
    }
  },

  // Obtener programas por portafolio
  getProgramsByPortfolio: async (portfolioId, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        portafolio: portfolioId.toString()
      });

      const response = await api.get(`/programs?${params}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener programas del portafolio';
      throw new Error(message);
    }
  },

  // Crear nuevo programa
  createProgram: async (programData) => {
    try {
      const response = await api.post('/programs', programData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al crear programa';
      throw new Error(message);
    }
  },

  // Actualizar programa
  updateProgram: async (id, programData) => {
    try {
      const response = await api.put(`/programs/${id}`, programData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar programa';
      throw new Error(message);
    }
  },

  // Eliminar programa
  deleteProgram: async (id) => {
    try {
      const response = await api.delete(`/programs/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar programa';
      throw new Error(message);
    }
  }
};

export default programService;