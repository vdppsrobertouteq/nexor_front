// File: frontend/src/contexts/SessionManager.jsx
import authService from '../services/authService';
import Swal from 'sweetalert2';

class SessionManager {
  static instance = null;

  constructor() {
    if (SessionManager.instance) {
      return SessionManager.instance;
    }
    SessionManager.instance = this;
    this.isHandlingSession = false;
  }

  async checkSession(options = {}) {
    const { requiredRoles = [], currentPath = '' } = options;

    if (this.isHandlingSession) {
      return { isValid: false, skipMessage: true };
    }

    const token = authService.getToken();
    const user = authService.getUser();

    if (!token || !user) {
      return {
        isValid: false,
        reason: 'NO_AUTH',
        message: 'Debes iniciar sesión para acceder a esta sección.',
        icon: 'warning'
      };
    }

    if (this.isTokenExpired(token)) {
      return {
        isValid: false,
        reason: 'TOKEN_EXPIRED',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
        icon: 'error'
      };
    }

    if (requiredRoles.length > 0 && !this.hasRole(user.nombre_rol, requiredRoles)) {
      return {
        isValid: false,
        reason: 'INSUFFICIENT_PERMISSIONS',
        message: 'No tienes permisos para acceder a esta sección.',
        icon: 'error'
      };
    }

    if (currentPath && this.isUnauthorizedRouteAccess(currentPath, user.nombre_rol)) {
      return {
        isValid: false,
        reason: 'UNAUTHORIZED_ROUTE_ACCESS',
        message: 'Acceso no autorizado detectado. Tu sesión ha sido cerrada por seguridad.',
        icon: 'error'
      };
    }

    return { isValid: true };
  }

  async handleInvalidSession(result, logoutCallback, navigateCallback) {
    if (result.skipMessage) return;

    this.isHandlingSession = true;

    try {
      authService.logout();
      logoutCallback();

      if (result.message) {
        await Swal.fire({
          title: 'Atención',
          text: result.message,
          icon: result.icon || 'info',
          confirmButtonText: 'Aceptar'
        });

      }

      navigateCallback('/login');
    } finally {
      setTimeout(() => {
        this.isHandlingSession = false;
      }, 1000);
    }
  }

  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  hasRole(userRole, allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return rolesArray.includes(userRole);
  }

  isUnauthorizedRouteAccess(currentPath, userRole) {
    const roleRoutes = {
      'Superadministrador': '/dashboard/superadmin',
      'Administrador': '/dashboard/admin',
      'Colaborador': '/dashboard/colaborador',
      'Cliente': '/dashboard/cliente'
    };

    const isDashboardRoute = currentPath.startsWith('/dashboard/');

    if (isDashboardRoute) {
      const userCorrectRoute = roleRoutes[userRole];

      if (!userCorrectRoute || !currentPath.startsWith(userCorrectRoute)) {
        return true;
      }
    }

    return false;
  }

  getCorrectRouteForRole(userRole) {
    const roleRoutes = {
      'Superadministrador': '/dashboard/superadmin',
      'Administrador': '/dashboard/admin',
      'Colaborador': '/dashboard/colaborador',
      'Cliente': '/dashboard/cliente'
    };

    return roleRoutes[userRole] || '/login';
  }
}

export default new SessionManager();