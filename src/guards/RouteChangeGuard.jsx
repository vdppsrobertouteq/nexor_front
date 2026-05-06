// File: frontend/src/guards/RouteChangeGuard.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../contexts/useAuth';
import SessionManager from '../contexts/SessionManager';

const RouteChangeGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkRouteAccess = async () => {
      const currentPath = location.pathname;
      
      // Rutas públicas que no requieren autenticación
      const publicRoutes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
      
      // Si es ruta pública, permitir acceso
      if (publicRoutes.includes(currentPath)) {
        return;
      }

      // Verificar si la ruta requiere autenticación
      const isDashboardRoute = currentPath.startsWith('/dashboard/');
      
      if (isDashboardRoute && isAuthenticated) {
        const result = await SessionManager.checkSession({
          currentPath: currentPath
        });

        if (!result.isValid && result.reason === 'UNAUTHORIZED_ROUTE_ACCESS') {
          await SessionManager.handleInvalidSession(
            result,
            logout,
            navigate
          );
          return;
        }
      }

      // Redireccionar usuarios autenticados desde rutas públicas a su dashboard
      if (currentPath === '/' && isAuthenticated && user) {
        const correctRoute = SessionManager.getCorrectRouteForRole(user.nombre_rol);
        if (correctRoute !== '/login') {
          navigate(correctRoute, { replace: true });
        }
      }
    };

    checkRouteAccess();
  }, [location.pathname, user, isAuthenticated, logout, navigate]);

  return null;
};

export default RouteChangeGuard;