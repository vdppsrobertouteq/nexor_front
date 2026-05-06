// File: frontend/src/services/documentService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

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

const documentService = {
  // Obtener usuarios involucrados en el proyecto para asignar como firmantes
  getProjectUsers: async (projectId) => {
    try {
      const response = await api.get(`/documents/project-users/${projectId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener usuarios del proyecto';
      throw new Error(message);
    }
  },

  // Subir nuevo documento con firmantes
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al subir documento';
      throw new Error(message);
    }
  },

  // Subir nueva versión de documento existente
  uploadNewVersion: async (formData) => {
    try {
      const response = await api.post('/documents/upload-version', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al subir nueva versión';
      throw new Error(message);
    }
  },

  // Obtener documentos de un proyecto
  getDocumentsByProject: async (projectId) => {
    try {
      const response = await api.get(`/documents/project/${projectId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener documentos';
      throw new Error(message);
    }
  },

  // Obtener firmantes de una versión específica
  getFirmantesByVersion: async (versionId) => {
    try {
      const response = await api.get(`/documents/version/${versionId}/firmantes`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener firmantes';
      throw new Error(message);
    }
  },

  // Firmar documento
  signDocument: async (versionId, signatureData) => {
    try {
      const response = await api.post(`/documents/sign/${versionId}`, signatureData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      // Muestra el mensaje real del backend
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Error al firmar documento';
      throw new Error(message);
    }
  },

  // Rechazar documento
  rejectDocument: async (versionId, comentario) => {
    try {
      const response = await api.post(`/documents/reject/${versionId}`, { comentario });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al rechazar documento';
      throw new Error(message);
    }
  },

  // Obtener historial de versiones
  getVersionHistory: async (documentId) => {
    try {
      const response = await api.get(`/documents/versiones/${documentId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener historial';
      throw new Error(message);
    }
  },

  // Obtener lista maestra (documentos firmados)
  getListaMaestra: async (projectId) => {
    try {
      const response = await api.get(`/documents/lista-maestra/${projectId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener lista maestra';
      throw new Error(message);
    }
  }
};

export default documentService;