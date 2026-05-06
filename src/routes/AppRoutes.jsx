// File: frontend/src/routes/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Componentes de páginas
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// Admin
import DashboardMetrics from '../pages/Administrador/AdminDashboard/DashboardMetrics';
import AdminPortfolios from '../pages/Administrador/AdminPortfolios/AdminPortfolios';
import AdminPrograms from '../pages/Administrador/AdminPrograms/AdminPrograms';
import AdminProjects from '../pages/Administrador/AdminProjects/AdminProjects';
import AdminTasks from '../pages/Administrador/AdminTasks/AdminTasks';
import Meetings from '../pages/Administrador/AdminMeetings/Meetings';
import AdminDocuments from '../pages/Administrador/AdminDocuments/AdminDocuments';

// Superadministrador
import SuperDashboardMetrics from '../pages/Superadministrador/SuperAdminDashboard/SuperDashboardMetrics';
import SuperAdminUsuarios from '../pages/Superadministrador/SuperAdminUsuarios/SuperAdminUsuarios';
import SuperAdminPortfolios from '../pages/Superadministrador/SuperAdminPortfolios/SuperAdminPortfolios';
import SuperAdminPrograms from '../pages/Superadministrador/SuperAdminPrograms/SuperAdminPrograms';
import SuperAdminProjects from '../pages/Superadministrador/SuperAdminProjects/SuperAdminProjects';
import SuperAdminTasks from '../pages/Superadministrador/SuperAdminTasks/SuperAdminTasks';
import SuperAdminDocuments from '../pages/Superadministrador/SuperAdminDocuments/SuperAdminDocuments';
import SuperMeetings from '../pages/Superadministrador/SuperAdminMeetings/SuperMeetings';

// Colaborador
import ColabProjects from '../pages/Colaborador/ColabProjects/ColabProjects';
import ColabTasks from '../pages/Colaborador/ColabTasks/ColabTasks';
import Documents from '../pages/Colaborador/ColabDocuments/Documents';

// Cliente
import ClientProjects from '../pages/Cliente/ClientProjects/ClientProjects';
import ClientTasks from '../pages/Cliente/ClientTasks/ClientTasks';
import ClientDocuments from '../pages/Cliente/ClientDocuments/ClientDocuments';


// Guards
import RoleGuard from '../guards/RoleGuard';
import TokenExpirationGuard from '../guards/TokenExpirationGuard';
import RouteChangeGuard from '../guards/RouteChangeGuard';

const AppRoutes = () => (
  <Router>
    <AuthProvider>
      <TokenExpirationGuard>
        <RouteChangeGuard />
        <Routes>
          /* Rutas públicas */
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas para Superadministrador */}
          <Route
            path="/dashboard/superadmin"
            element={
              <RoleGuard
                element={<SuperDashboardMetrics />}
                allowedRoles={['Superadministrador']}
              />
            }
          />
          <Route
            path="/dashboard/superadmin/usuarios"
            element={
              <RoleGuard
                element={<SuperAdminUsuarios />}
                allowedRoles={['Superadministrador']}
              />
            }
          />
          {/*-----------------------------------*/}
          <Route
            path="/dashboard/superadmin/portfolios"
            element={
              <RoleGuard
                element={<SuperAdminPortfolios />}
                allowedRoles={['Administrador', 'Superadministrador']}
              />
            }
          />
          <Route
            path="/dashboard/superadmin/programs"
            element={
              <RoleGuard
                element={<SuperAdminPrograms />}
                allowedRoles={['Administrador', 'Superadministrador']}
              />
            }
          />
          <Route
            path="/dashboard/superadmin/projects"
            element={
              <RoleGuard
                element={<SuperAdminProjects />}
                allowedRoles={['Administrador', 'Superadministrador']}
              />
            }
          />
          <Route
            path="/dashboard/superadmin/tasks"
            element={
              <RoleGuard
                element={<SuperAdminTasks />}
                allowedRoles={['Administrador', 'Superadministrador']}
              />
            }
          />
          <Route
            path="/dashboard/superadmin/documents"
            element={
              <RoleGuard
                element={<SuperAdminDocuments />}
                allowedRoles={['Administrador', 'Superadministrador']}
              />
            }
          />
          <Route
            path="/dashboard/superadmin/meetings"
            element={
              <RoleGuard
                element={<SuperMeetings />}
                allowedRoles={['Superadministrador','Administrador', 'Colaborador', 'Cliente']}
              />
            }
          />

          {/* Rutas para Administrador */}

          <Route
            path="/dashboard/admin"
            element={
              <RoleGuard
                element={<DashboardMetrics />}
                allowedRoles={['Administrador']}
              />
            }
          />
          <Route
            path="/dashboard/admin/portfolios"
            element={
              <RoleGuard
                element={<AdminPortfolios />}
                allowedRoles={['Administrador']}
              />
            }
          />
          <Route
            path="/dashboard/admin/programs"
            element={
              <RoleGuard
                element={<AdminPrograms />}
                allowedRoles={['Administrador']}
              />
            }
          />
          <Route
            path="/dashboard/admin/projects"
            element={
              <RoleGuard
                element={<AdminProjects />}
                allowedRoles={['Administrador']}
              />
            }
          />
          <Route
            path="/dashboard/admin/tasks"
            element={
              <RoleGuard
                element={<AdminTasks />}
                allowedRoles={['Administrador']}
              />
            }
          />
          <Route
            path="/dashboard/administrador/documents"
            element={
              <RoleGuard
                element={<AdminDocuments />}
                allowedRoles={['Administrador']}
              />
            }
          />
          <Route
            path="/dashboard/administrador/meetings"
            element={
              <RoleGuard
                element={<Meetings />}
                allowedRoles={['Administrador', 'Colaborador', 'Cliente']}
              />
            }
          />

          {/* Rutas para Colaborador */}

          <Route
            path="/dashboard/colaborador"
            element={
              <RoleGuard
                element={<ColabProjects />}
                allowedRoles={['Colaborador']}
              />
            }
          />
          <Route
            path="/dashboard/colaborador/tasks"
            element={
              <RoleGuard
                element={<ColabTasks />}
                allowedRoles={['Colaborador']}
              />
            }
          />
          <Route
            path="/dashboard/colaborador/documents"
            element={
              <RoleGuard
                element={<Documents />}
                allowedRoles={['Colaborador']}
              />
            }
          />
          <Route
            path="/dashboard/colaborador/meetings"
            element={
              <RoleGuard
                element={<Meetings />}
                allowedRoles={['Administrador', 'Colaborador', 'Cliente']}
              />
            }
          />


          {/* Rutas para Cliente */}
          <Route
            path="/dashboard/cliente"
            element={
              <RoleGuard
                element={<ClientProjects />}
                allowedRoles={['Cliente']}
              />
            }
          />
          <Route
            path="/dashboard/cliente/tasks"
            element={
              <RoleGuard
                element={<ClientTasks />}
                allowedRoles={['Cliente']}
              />
            }
          />
          <Route
            path="/dashboard/cliente/documents"
            element={
              <RoleGuard
                element={<ClientDocuments />}
                allowedRoles={['Cliente']}
              />
            }
          />
          <Route
            path="/dashboard/cliente/meetings"
            element={
              <RoleGuard
                element={<Meetings />}
                allowedRoles={['Administrador', 'Colaborador', 'Cliente']}
              />
            }
          />


          {/* <Route
            path="/dashboard/superadmin/*"
            element={
              <RoleGuard
                element={<DashboardSuperAdmin />}
                allowedRoles={['Superadministrador']}
              />
            }
          />
          <Route
            path="/dashboard/admin/*"
            element={
              <RoleGuard
                element={<DashboardAdmin />}
                allowedRoles={['Administrador']}
              />
            }
          />
          <Route
            path="/dashboard/colaborador/*"
            element={
              <RoleGuard
                element={<DashboardColaborador />}
                allowedRoles={['Colaborador']}
              />
            }
          />
          <Route
            path="/dashboard/cliente/*"
            element={
              <RoleGuard
                element={<DashboardCliente />}
                allowedRoles={['Cliente']}
              />
            }
          /> */}

          {/* Ruta 404 */}
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
      </TokenExpirationGuard>
    </AuthProvider>
  </Router>
);

export default AppRoutes;