// File: frontend/src/services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Configurar axios
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
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {

  // Funciones de autenticación

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data;

      // Guardar token en localStorage
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Log para verificar guardado
        console.log('Token guardado:', data.data.token);
        console.log('User guardado:', data.data.user);
      }

      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error de conexión';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    return !!token;
  },

  //Funciones para registro y verificación de email

  register: async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Error en registro';
        throw new Error(message);
    }
},

  verifyEmail: async (email, codigo) => {
    try {
      const response = await api.post('/auth/verify-email', { email, codigo });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error en verificación';
      throw new Error(message);
    }
  },

  sendVerificationCode: async (data) => {
    try {
        const response = await api.post('/auth/send-verification-code', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Error al enviar código';
        throw new Error(message);
    }
},

  resendVerificationCode: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al reenviar código';
      throw new Error(message);
    }
  },

  // Funciones para recuperación de contraseña

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al solicitar recuperación';
      throw new Error(message);
    }
  },

  verifyResetCode: async (email, codigo) => {
    try {
      const response = await api.post('/auth/verify-reset-code', { email, codigo });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al verificar código';
      throw new Error(message);
    }
  },

  resetPassword: async (email, codigo, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        codigo,
        newPassword
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al restablecer contraseña';
      throw new Error(message);
    }
  }


};

export default authService;