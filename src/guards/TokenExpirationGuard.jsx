// File: frontend/src/guards/TokenExpirationGuard.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/useAuth';
import SessionManager from '../contexts/SessionManager';

const TokenExpirationGuard = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      if (!isAuthenticated) {
        return;
      }

      const result = await SessionManager.checkSession({});

      if (!result.isValid && result.reason === 'TOKEN_EXPIRED') {
        await SessionManager.handleInvalidSession(
          result,
          logout,
          navigate
        );
      }
    };

    if (isAuthenticated) {
      // Verificar cada 30 segundos
      intervalRef.current = setInterval(checkTokenExpiration, 30000);

      // Verificar también en eventos de visibilidad
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkTokenExpiration();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isAuthenticated, logout, navigate]);

  return children;
};

export default TokenExpirationGuard;