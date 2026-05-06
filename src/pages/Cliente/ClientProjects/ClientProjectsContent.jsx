// File: frontend/src/pages/Cliente/ClientProjects/ClientProjectsContent.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Row, Col, Typography, message, Spin } from 'antd';
import { EyeOutlined, CalendarOutlined, UserOutlined, ProjectOutlined, FlagOutlined } from '@ant-design/icons';
import useAuth from '../../../contexts/useAuth';
import userProjectService from '../../../services/userProjectService'; // Importa el servicio para obtener proyectos
import { useNavigate } from 'react-router-dom';
import './MyProjects.css';

const { Title, Text, Paragraph } = Typography;

const ClientProjectsContent = ({ onProjectSelect }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener los datos de los proyectos
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await userProjectService.getMyProjects();
      setProjects(response.data || []);
    } catch (error) {
      message.error('Error al cargar los proyectos');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Función para obtener el color del tag según el estatus
  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'green';
      case 'Finalizado': return 'blue';
      case 'Cancelado': return 'red';
      default: return 'default';
    }
  };

  // Función para obtener el color del tag según el nivel de riesgo
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Nulo': return 'green';
      case 'Bajo': return 'cyan';
      case 'Medio': return 'orange';
      case 'Alto': return 'red';
      default: return 'default';
    }
  };

  // Función para abrir el proyecto
  const handleOpenProject = (project) => {
    const projectData = {
      id: project.id,
      nombre: project.nombre,
      descripcion: project.descripcion,
      estatus: project.estatus,
      nivel_riesgo: project.nivel_riesgo,
      fecha_creacion: project.fecha_creacion,
      programa: project.programa,
      creador: project.creador,
      tipo_proyecto: project.tipo_proyecto,
      id_programa: project.id_programa,
      id_creador: project.id_creador,
      id_tipo_proyecto: project.id_tipo_proyecto
    };

    console.log('Proyecto seleccionado:', projectData);

    if (onProjectSelect) {
      onProjectSelect(projectData);
    } else {
      sessionStorage.setItem('selectedProject', JSON.stringify(projectData));
      message.info(`Abriendo proyecto: ${project.nombre}`);
      navigate('/dashboard/cliente/tasks');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="projects-loading">
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>Cargando proyectos...</Text>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <Title level={2} className="projects-title">
          Mis Proyectos: Cliente
        </Title>
      </div>

      <Row gutter={[24, 24]} className="projects-grid">
        {projects.map((project) => (
          <Col
            key={project.id}
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={6}
            className="project-col"
          >
            <Card
              className="project-card"
              hoverable
              actions={[
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleOpenProject(project)}
                  className="open-project-btn"
                >
                  Abrir Proyecto
                </Button>
              ]}
            >
              <div className="project-card-content">
                <div className="project-header">
                  <Title level={4} className="project-name" ellipsis={{ tooltip: project.nombre }}>
                    {project.nombre}
                  </Title>
                  <div className="project-status-tags">
                    <Tag color={getStatusColor(project.estatus)} className="status-tag">
                      {project.estatus}
                    </Tag>
                    <Tag color={getRiskColor(project.nivel_riesgo)} className="risk-tag">
                      <FlagOutlined /> {project.nivel_riesgo}
                    </Tag>
                  </div>
                </div>

                <Paragraph
                  ellipsis={{ rows: 2, tooltip: project.descripcion }}
                  className="project-description"
                >
                  {project.descripcion}
                </Paragraph>

                <div className="project-details">
                  <div className="project-detail-item">
                    <CalendarOutlined className="detail-icon" />
                    <Text className="detail-text">
                      <strong>Creado:</strong> {formatDate(project.fecha_creacion)}
                    </Text>
                  </div>

                  <div className="project-detail-item">
                    <ProjectOutlined className="detail-icon" />
                    <Text className="detail-text" ellipsis={{ tooltip: project.programa }}>
                      <strong>Programa:</strong> {project.programa}
                    </Text>
                  </div>

                  <div className="project-detail-item">
                    <UserOutlined className="detail-icon" />
                    <Text className="detail-text" ellipsis={{ tooltip: project.creador }}>
                      <strong>Creador:</strong> {project.creador}
                    </Text>
                  </div>

                  <div className="project-detail-item">
                    <Text className="detail-text" ellipsis={{ tooltip: project.tipo_proyecto }}>
                      <strong>Tipo:</strong> {project.tipo_proyecto}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {projects.length === 0 && !loading && (
        <div className="no-projects">
          <ProjectOutlined className="no-projects-icon" />
          <Title level={4}>No hay proyectos disponibles</Title>
          <Text>Aún no tienes proyectos como cliente.</Text>
        </div>
      )}
    </div>
  );
};

export default ClientProjectsContent;