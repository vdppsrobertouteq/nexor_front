// File: frontend/src/guards/RoleGuard.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../contexts/useAuth';
import SessionManager from '../contexts/SessionManager';

const RoleGuard = ({ element, allowedRoles }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await SessionManager.checkSession({
          requiredRoles: allowedRoles,
          currentPath: location.pathname
        });

        if (!result.isValid) {
          setShouldRedirect(true);
          await SessionManager.handleInvalidSession(
            result,
            logout,
            () => {} // La navegación se maneja con shouldRedirect
          );
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setShouldRedirect(true);
      }
    };

    checkAccess();
  }, [allowedRoles, location.pathname, logout]);

  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return element;
};

export default RoleGuard;