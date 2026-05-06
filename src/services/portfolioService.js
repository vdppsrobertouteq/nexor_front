// File: frontend/src/services/portfolioService.js
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

const portfolioService = {
    // Obtener todos los portafolios con paginación y filtros
    getPortfolios: async (page = 1, limit = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...filters
            });

            const response = await api.get(`/portfolios?${params}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener portafolios';
            throw new Error(message);
        }
    },

    // Obtener portafolio por ID
    getPortfolioById: async (id) => {
        try {
            const response = await api.get(`/portfolios/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al obtener portafolio';
            throw new Error(message);
        }
    },

    // Crear nuevo portafolio
    createPortfolio: async (portfolioData) => {
        try {
            const response = await api.post('/portfolios', portfolioData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al crear portafolio';
            throw new Error(message);
        }
    },

    // Actualizar portafolio
    updatePortfolio: async (id, portfolioData) => {
        try {
            const response = await api.put(`/portfolios/${id}`, portfolioData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al actualizar portafolio';
            throw new Error(message);
        }
    },

    // Eliminar portafolio
    deletePortfolio: async (id) => {
        try {
            const response = await api.delete(`/portfolios/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Error al eliminar portafolio';
            throw new Error(message);
        }
    }
};

export default portfolioService;