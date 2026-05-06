// File: frontend/src/pages/Administrador/AdminDashboard/DashboardContent.jsx
import React from 'react';
import useAuth from '../../../contexts/useAuth';

const DashboardContent = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <p>Cargando usuario...</p>;
  if (!isAuthenticated) return <p>Acceso no autorizado</p>;

  return (
    <div>
      <h1>Panel de Administrador</h1>
      <p>Bienvenido al panel de administración. Aquí puedes gestionar y supervisar todas las funciones del sistema.</p>

      <hr />

      <h2>Información del Usuario</h2>
      <ul>
        <li><strong>ID:</strong> {user.id}</li>
        <li><strong>Nombre:</strong> {user.nombre}</li>
        <li><strong>Apellido:</strong> {user.apellido}</li>
        <li><strong>Email:</strong> {user.email}</li>
        <li><strong>Teléfono:</strong> {user.telefono}</li>
        <li><strong>Rol:</strong> {user.nombre_rol}</li>
        <li><strong>ID Rol:</strong>{user.id_rol}</li>
        <li><strong>Descripción del Rol:</strong> {user.rol_descripcion}</li>
        <li><strong>Activo:</strong> {user.activo ? 'Sí' : 'No'}</li>
        <li><strong>Última sesión:</strong> {new Date(user.ultima_sesion).toLocaleString()}</li>
      </ul>
    </div>
  );
};

export default DashboardContent;
