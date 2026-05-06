// File: frontend/src/services/userTaskService.js
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

const userTaskService = {
    // Obtener todas las tareas de un proyecto
    getProjectTasks: async (projectId) => {
        try {
            const response = await api.get(`/user-tasks/project/${projectId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener tareas';
            throw new Error(message);
        }
    },
    // Cambiar estatus de la tarea (solo si pertenece al usuario logueado)
    changeTaskStatus: async (taskId, status) => {
        try {
            const response = await api.patch(`/user-tasks/${taskId}/status`, { estatus: status });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al actualizar estatus';
            throw new Error(message);
        }
    }
};

export default userTaskService;