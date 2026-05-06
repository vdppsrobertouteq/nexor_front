// File: frontend/src/services/meetingService.js
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

const meetingService = {
    // Crear nueva reunión
    createMeeting: async (meetingData) => {
        try {
            const response = await api.post('/meetings', meetingData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al crear reunión';
            throw new Error(message);
        }
    },

    // Obtener reuniones del usuario (donde está involucrado)
    getMyMeetings: async () => {
        try {
            const response = await api.get('/meetings/my-meetings');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener reuniones';
            throw new Error(message);
        }
    },

    // Obtener reuniones de un proyecto específico
    getProjectMeetings: async (projectId) => {
        try {
            const response = await api.get(`/meetings/project/${projectId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener reuniones del proyecto';
            throw new Error(message);
        }
    },

    // Obtener una reunión específica por ID
    getMeetingById: async (meetingId) => {
        try {
            const response = await api.get(`/meetings/${meetingId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener reunión';
            throw new Error(message);
        }
    },

    // Actualizar reunión
    updateMeeting: async (meetingId, meetingData) => {
        try {
            const response = await api.put(`/meetings/${meetingId}`, meetingData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al actualizar reunión';
            throw new Error(message);
        }
    },

    // Eliminar reunión
    deleteMeeting: async (meetingId) => {
        try {
            const response = await api.delete(`/meetings/${meetingId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al eliminar reunión';
            throw new Error(message);
        }
    },

    // Obtener usuarios involucrados en un proyecto
    getProjectUsers: async (projectId) => {
        try {
            const response = await api.get(`/meetings/project/${projectId}/users`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener usuarios del proyecto';
            throw new Error(message);
        }
    },

    // Obtener tipos de reunión
    getMeetingTypes: async () => {
        try {
            const response = await api.get('/meetings/types');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener tipos de reunión';
            throw new Error(message);
        }
    },

    // Confirmar asistencia a reunión
    confirmAttendance: async (meetingId) => {
        try {
            const response = await api.patch(`/meetings/${meetingId}/confirm-attendance`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al confirmar asistencia';
            throw new Error(message);
        }
    },
};

export default meetingService;