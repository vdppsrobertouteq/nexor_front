// File: frontend/src/services/dashboardService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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

const dashboardService = {
  // Obtener resumen general del administrador
  getGeneralSummary: async () => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener resumen general';
      throw new Error(message);
    }
  },

  // Obtener distribución de estados de proyectos
  getProjectsStatusDistribution: async () => {
    try {
      const response = await api.get('/dashboard/projects-status');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener estados de proyectos';
      throw new Error(message);
    }
  },

  // Obtener distribución de riesgo de proyectos
  getProjectsRiskDistribution: async () => {
    try {
      const response = await api.get('/dashboard/projects-risk');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener riesgos de proyectos';
      throw new Error(message);
    }
  },

  // Obtener proyectos por portafolio
  getProjectsByPortfolio: async () => {
    try {
      const response = await api.get('/dashboard/projects-by-portfolio');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener proyectos por portafolio';
      throw new Error(message);
    }
  },

  // Obtener distribución de estados de tareas
  getTasksStatusDistribution: async (projectId = null) => {
    try {
      const params = projectId ? { projectId } : {};
      const response = await api.get('/dashboard/tasks-status', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener estados de tareas';
      throw new Error(message);
    }
  },

  // Obtener distribución de prioridad de tareas
  getTasksPriorityDistribution: async () => {
    try {
      const response = await api.get('/dashboard/tasks-priority');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener prioridades de tareas';
      throw new Error(message);
    }
  },

  // Obtener proyectos con más tareas pendientes
  getProjectsWithPendingTasks: async () => {
    try {
      const response = await api.get('/dashboard/projects-pending-tasks');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener proyectos con tareas pendientes';
      throw new Error(message);
    }
  },

  // Obtener documentos pendientes de firma
  getPendingDocuments: async () => {
    try {
      const response = await api.get('/dashboard/pending-documents');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener documentos pendientes';
      throw new Error(message);
    }
  },

  // Obtener reuniones agendadas
  getScheduledMeetings: async (period = 'today') => {
    try {
      const response = await api.get('/dashboard/scheduled-meetings', { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener reuniones agendadas';
      throw new Error(message);
    }
  },

  // Obtener KPIs por período
  getKPIsByPeriod: async (days = 30) => {
    try {
      const response = await api.get('/dashboard/kpis', { 
        params: { days } 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener KPIs';
      throw new Error(message);
    }
  },

  // Obtener estadísticas de documentos firmados vs pendientes
  getDocumentsSignedStats: async (projectId = null) => {
    try {
      const params = projectId ? { projectId } : {};
      const response = await api.get('/dashboard/documents-signed-stats', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener estadísticas de documentos';
      throw new Error(message);
    }
  }
};

export default dashboardService;