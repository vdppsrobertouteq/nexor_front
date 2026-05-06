// File: frontend/src/services/projectService.js
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

const projectService = {
    // Obtener todos los proyectos con paginación y filtros
    getProjects: async (page = 1, limit = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...filters
            });

            const response = await api.get(`/projects?${params}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener proyectos';
            throw new Error(message);
        }
    },

    // Obtener proyecto por ID
    getProjectById: async (id) => {
        try {
            const response = await api.get(`/projects/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener proyecto';
            throw new Error(message);
        }
    },

    // Obtener proyectos por programa
    getProjectsByProgram: async (programId, page = 1, limit = 10) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                programa: programId.toString()
            });

            const response = await api.get(`/projects?${params}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener proyectos del programa';
            throw new Error(message);
        }
    },

    // Crear nuevo proyecto
    createProject: async (projectData) => {
        try {
            const response = await api.post('/projects', projectData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al crear proyecto';
            throw new Error(message);
        }
    },

    // Actualizar proyecto
    updateProject: async (id, projectData) => {
        try {
            const response = await api.put(`/projects/${id}`, projectData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al actualizar proyecto';
            throw new Error(message);
        }
    },

    // Eliminar proyecto
    deleteProject: async (id) => {
        try {
            const response = await api.delete(`/projects/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al eliminar proyecto';
            throw new Error(message);
        }
    },

    // Funciones para asignar usuarios a proyectos

    // Asignar usuario a proyecto
    assignUserToProject: async (projectId, userId, roleId) => {
        try {
            const response = await api.post(`/projects/${projectId}/members`, {
                userId,
                roleId
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al asignar usuario al proyecto';
            throw new Error(message);
        }
    },

    // Remover usuario de proyecto
    removeUserFromProject: async (projectId, userId) => {
        try {
            const response = await api.delete(`/projects/${projectId}/members/${userId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al remover usuario del proyecto';
            throw new Error(message);
        }
    },

    // Actualizar getProjectUsers para usar la estructura correcta:
    getProjectUsers: async (projectId) => {
        try {
            const response = await api.get(`/projects/${projectId}/members`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener usuarios del proyecto';
            throw new Error(message);
        }
    },

    // Obtener usuarios disponibles para asignar al proyecto
    getAvailableUsers: async () => {
        try {
            const response = await api.get('/users/available');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener usuarios disponibles';
            throw new Error(message);
        }
    }
};

export default projectService;