// File: frontend/src/services/taskService.js
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

const taskService = {
    // Obtener todas las tareas de un proyecto
    getTasksByProject: async (projectId) => {
        try {
            const response = await api.get(`/projects/${projectId}/tasks`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener tareas';
            throw new Error(message);
        }
    },

    // Crear nueva tarea
    createTask: async (projectId, taskData) => {
        try {
            const response = await api.post(`/projects/${projectId}/tasks`, taskData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al crear tarea';
            throw new Error(message);
        }
    },

    // Actualizar tarea
    updateTask: async (projectId, taskId, taskData) => {
        try {
            const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al actualizar tarea';
            throw new Error(message);
        }
    },

    // Eliminar tarea
    deleteTask: async (projectId, taskId) => {
        try {
            const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al eliminar tarea';
            throw new Error(message);
        }
    },

    // Actualizar estatus de tarea (drag and drop)
    updateTaskStatus: async (taskId, newStatus) => {
        try {
            const response = await api.put(`/tasks/${taskId}/status`, { estatus: newStatus });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al actualizar estado de tarea';
            throw new Error(message);
        }
    }
};

export default taskService;