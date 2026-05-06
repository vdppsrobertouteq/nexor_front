// File: frontend/src/services/superadminMetricsService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

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

const superadminMetricsService = {
  // Obtener resumen general global
  getGeneralSummary: async () => {
    try {
      const response = await api.get('/superadmin-metrics/summary');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener resumen general global';
      throw new Error(message);
    }
  },

  // Obtener distribución de estados de proyectos (global)
  getProjectsStatusDistribution: async () => {
    try {
      const response = await api.get('/superadmin-metrics/projects-status');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener estados globales de proyectos';
      throw new Error(message);
    }
  },

  // Obtener distribución de riesgo de proyectos (global)
  getProjectsRiskDistribution: async () => {
    try {
      const response = await api.get('/superadmin-metrics/projects-risk');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener riesgos globales de proyectos';
      throw new Error(message);
    }
  },

  // Obtener proyectos por portafolio (global)
  getProjectsByPortfolio: async () => {
    try {
      const response = await api.get('/superadmin-metrics/projects-by-portfolio');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener proyectos por portafolio globales';
      throw new Error(message);
    }
  },

  // Obtener distribución de estados de tareas (global)
  getTasksStatusDistribution: async () => {
    try {
      const response = await api.get('/superadmin-metrics/tasks-status');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener estados globales de tareas';
      throw new Error(message);
    }
  },

  // Obtener distribución de prioridad de tareas (global)
  getTasksPriorityDistribution: async () => {
    try {
      const response = await api.get('/superadmin-metrics/tasks-priority');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener prioridades globales de tareas';
      throw new Error(message);
    }
  },

  // Obtener proyectos con más tareas pendientes (global)
  getProjectsWithPendingTasks: async () => {
    try {
      const response = await api.get('/superadmin-metrics/projects-pending-tasks');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener proyectos globales con tareas pendientes';
      throw new Error(message);
    }
  },

  // Obtener documentos pendientes de firma (global)
  getPendingDocuments: async () => {
    try {
      const response = await api.get('/superadmin-metrics/pending-documents');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener documentos pendientes globales';
      throw new Error(message);
    }
  },

  // Obtener reuniones agendadas (global)
  getScheduledMeetings: async (period = 'today') => {
    try {
      const response = await api.get('/superadmin-metrics/scheduled-meetings', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener reuniones agendadas globales';
      throw new Error(message);
    }
  },

  // Obtener KPIs por período (global)
  getKPIsByPeriod: async (days = 30) => {
    try {
      const response = await api.get('/superadmin-metrics/kpis', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener KPIs globales';
      throw new Error(message);
    }
  },

  // Obtener estadísticas de documentos firmados vs pendientes (global)
  getDocumentsSignedStats: async (projectId = null) => {
    try {
      const params = projectId ? { projectId } : {};
      const response = await api.get('/superadmin-metrics/documents-signed-stats', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener estadísticas de documentos globales';
      throw new Error(message);
    }
  }
};

export default superadminMetricsService;