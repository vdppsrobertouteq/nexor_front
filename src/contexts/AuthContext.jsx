// File: frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si el token ha expirado
  const isTokenExpired = useCallback(() => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }, [token]);

  // Inicializar estado desde localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = authService.getToken();
      const savedUser = authService.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

// Función de login actualizada
const login = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    
    if (response.success && response.data) {
      const { user: userData, token: userToken } = response.data;
      
      setUser(userData);
      setToken(userToken);
      setIsAuthenticated(true);
      
      return response;
    } else {
      throw new Error(response.message || 'Error en el inicio de sesión');
    }
  } catch (error) {
    throw error;
  }
};

  // Función de logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((allowedRoles) => {
    if (!user || !user.nombre_rol) return false;
    
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return rolesArray.includes(user.nombre_rol);
  }, [user]);

  // Obtener la ruta correcta según el rol
  const getCorrectRouteForRole = useCallback((userRole) => {
    const roleRoutes = {
      'Superadministrador': '/dashboard/superadmin',
      'Administrador': '/dashboard/admin',
      'Colaborador': '/dashboard/colaborador',
      'Cliente': '/dashboard/cliente'
    };

    return roleRoutes[userRole] || '/login';
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isTokenExpired,
    getCorrectRouteForRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;