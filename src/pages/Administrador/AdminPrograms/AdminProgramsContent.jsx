// File: frontend/src/pages/Administrador/AdminPrograms/AdminProgramsContent.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, Input, Button, Modal, Form, message,
  Popconfirm, Row, Col, Typography, Space, Empty, Pagination, Spin, Select
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined, EditOutlined,
  DeleteOutlined, FolderOpenOutlined
} from '@ant-design/icons';
import './AdminPortfoliosContent.css';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../contexts/useAuth';
import programService from '../../../services/programService';
import projectTypeService from '../../../services/projectTypeService';

const { Title } = Typography;
const { TextArea } = Input;

const AdminProgramsContent = ({ selectedPortfolio, onProgramSelect }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [projectTypes, setProjectTypes] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);

  // Obtener portafolio desde sessionStorage si no se pasa como prop
  const getSelectedPortfolio = () => {
    if (selectedPortfolio) return selectedPortfolio;

    const stored = sessionStorage.getItem('selectedPortfolio');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored portfolio:', error);
        return null;
      }
    }
    return null;
  };

  const portfolio = getSelectedPortfolio();

  // Cargar programas del portafolio
  const loadPrograms = async (page = 1, search = '') => {
    if (!portfolio) {
      message.error('No hay portafolio seleccionado');
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    try {
      const filters = search ? { search, portafolio: portfolio.id } : { portafolio: portfolio.id };
      const response = await programService.getPrograms(page, pageSize, filters);

      setPrograms(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setCurrentPage(page);
    } catch (error) {
      message.error(error.message || 'Error al cargar programas');
      setPrograms([]);
    } finally {
      setPageLoading(false);
    }
  };

  // Efecto inicial
  useEffect(() => {
    if (portfolio) {
      loadPrograms();
    } else {
      setPageLoading(false);
      message.warning('No se encontró información del portafolio seleccionado');
    }
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        loadPrograms(1, searchTerm);
      } else {
        loadPrograms(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Carga los tipos de proyecto
  useEffect(() => {
    projectTypeService.getProjectTypes().then(setProjectTypes).catch(() => setProjectTypes([]));
  }, []);

  // Crear programa
  const handleCreateProgram = async (values) => {
    setLoading(true);
    try {
      const programData = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        id_portafolio: portfolio.id,
        id_administrador: user.id_rol,
        id_tipo_proyecto_programa: values.id_tipo_proyecto_programa // <-- cambio
      };

      await programService.createProgram(programData);
      message.success('Programa creado exitosamente');
      handleCloseModal();
      loadPrograms(currentPage, searchTerm);
    } catch (error) {
      message.error(error.message || 'Error al crear el programa');
    } finally {
      setLoading(false);
    }
  };

  // Editar programa
  const handleEditProgram = async (programId, values) => {
    setLoading(true);
    try {
      const updateData = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        id_tipo_proyecto_programa: values.id_tipo_proyecto_programa // <-- cambio
      };

      await programService.updateProgram(programId, updateData);
      message.success('Programa actualizado exitosamente');
      handleCloseModal();
      loadPrograms(currentPage, searchTerm);
    } catch (error) {
      message.error(error.message || 'Error al actualizar el programa');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar programa
  const handleDeleteProgram = async (programId) => {
    try {
      await programService.deleteProgram(programId);
      message.success('Programa eliminado exitosamente');

      // Si estamos en la última página y solo queda un elemento, ir a la página anterior
      const newTotal = totalItems - 1;
      const maxPage = Math.ceil(newTotal / pageSize);
      const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;

      loadPrograms(targetPage, searchTerm);
    } catch (error) {
      message.error(error.message || 'Error al eliminar el programa');
    }
  };

  // Abrir programa (para futura navegación a proyectos)
  const handleOpenProgram = (program) => {
    const programData = {
      id: program.id,
      nombre: program.nombre,
      descripcion: program.descripcion,
      id_portafolio: program.id_portafolio,
      portafolio_nombre: program.portafolio_nombre,
      id_administrador: program.id_administrador,
      id_tipo_proyecto_programa: program.id_tipo_proyecto_programa,
      tipo_proyecto_programa: program.tipo_proyecto_programa
    };
    
    console.log('Programa seleccionado:', programData);

    if (onProgramSelect) {
      onProgramSelect(programData);
    } else {
      sessionStorage.setItem('selectedProgram', JSON.stringify(programData));
      message.info(`Abriendo proyectos del programa: ${program.nombre}`);
      navigate('/dashboard/admin/projects');
    }
  };
  // Cambio de página
  const handlePageChange = (page) => {
    loadPrograms(page, searchTerm);
  };

  // Abrir modal para crear
  const handleOpenCreateModal = () => {
    setEditingProgram(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Abrir modal para editar
  const handleOpenEditModal = (program) => {
    setEditingProgram(program);
    form.setFieldsValue({
      nombre: program.nombre,
      descripcion: program.descripcion
    });
    setModalVisible(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingProgram(null);
    form.resetFields();
  };

  // Envío del formulario
  const handleFormSubmit = (values) => {
    if (editingProgram) {
      handleEditProgram(editingProgram.id, values);
    } else {
      handleCreateProgram(values);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Si no hay portafolio seleccionado
  if (!portfolio) {
    return (
      <div className="admin-portfolios-container">
        <div className="empty-state">
          <Empty
            description="No hay portafolio seleccionado"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portfolios-container">
      <div className="portfolios-header">
        <Title level={1} className="portfolios-title">
          Programas
        </Title>
        <div className="portfolio-breadcrumb">
          <Typography type="secondary">
            Portafolio: <strong>{portfolio.nombre}</strong>
          </Typography>
        </div>
      </div>

      <div className="portfolios-controls">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16} lg={18}>
            <Input
              placeholder="Buscar programas por nombre..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              className="create-button"
              size="large"
              block
            >
              Crear Programa
            </Button>
          </Col>
        </Row>
      </div>

      <div className="portfolios-content">
        {pageLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : programs.length === 0 ? (
          <div className="empty-state">
            <Empty
              description={searchTerm ? "No se encontraron programas que coincidan con la búsqueda" : "No hay programas creados en este portafolio"}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <div className="portfolios-grid">
              <Row gutter={[24, 24]}>
                {programs.map((program) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={program.id}>
                    <Card
                      className="portfolio-card"
                      title={
                        <div className="card-title">
                          <span className={`portfolio-name ${program.nombre.length > 40 ? 'marquee' : ''}`}>
                            {program.nombre}
                          </span>
                        </div>
                      }
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleOpenEditModal(program)}
                          className="action-button edit-button"
                          title="Editar programa"
                        >
                          Editar
                        </Button>,
                        <Button
                          key="open"
                          type="text"
                          icon={<FolderOpenOutlined />}
                          onClick={() => handleOpenProgram(program)}
                          className="action-button open-button"
                          title="Abrir proyectos"
                        >
                          Abrir
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="¿Eliminar programa?"
                          description="Esta acción no se puede deshacer. ¿Estás seguro?"
                          onConfirm={() => handleDeleteProgram(program.id)}
                          okText="Sí, eliminar"
                          cancelText="Cancelar"
                          okType="danger"
                        >
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="action-button delete-button"
                            title="Eliminar programa"
                            danger
                          >
                            Eliminar
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <div className="card-content">
                        <p className="portfolio-description">
                          {program.descripcion || 'Sin descripción'}
                        </p>
                        <div className="portfolio-date">
                          <strong>Creado:</strong> {formatDate(program.fecha_creacion)}
                        </div>
                        {program.administrador_nombre && (
                          <div className="portfolio-admin">
                            <strong>Administrador:</strong> {program.administrador_nombre}
                          </div>
                        )}
                        <div className="portfolio-admin">
                          <strong>Portafolio:</strong> {program.portafolio_nombre || portfolio.nombre}
                        </div>
                        {/* ...dentro del Card de Programas */}
                        <div className="portfolio-type">
                          <strong>Tipo de Proyectos:</strong> {program.tipo_proyecto_programa || 'No definido'}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {totalItems > pageSize && (
              <div className="pagination-container" style={{ textAlign: 'center', marginTop: '20px' }}>
                <Pagination
                  current={currentPage}
                  total={totalItems}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} programas`}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para crear/editar programa */}
      <Modal
        title={editingProgram ? 'Editar Programa' : 'Crear Nuevo Programa'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        className="portfolio-modal"
        width={550}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          scrollToFirstError
          className="portfolio-form"
        >
          <Form.Item
            label="Nombre del Programa"
            name="nombre"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre del programa' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              { max: 255, message: 'El nombre no puede exceder 255 caracteres' }
            ]}
          >
            <Input
              placeholder="Ingresa el nombre del programa"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="descripcion"
            rules={[
              { max: 1000, message: 'La descripción no puede exceder 1000 caracteres' }
            ]}
          >
            <TextArea
              placeholder="Describe brevemente el contenido del programa"
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            label="Tipo de Proyecto del Programa"
            name="id_tipo_proyecto_programa"
            rules={[{ required: true, message: 'Selecciona el tipo de proyecto' }]}>
            <Select
              placeholder="Selecciona el tipo de proyecto"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {projectTypes.map(tipo => (
                <Select.Option key={tipo.id} value={tipo.id}>
                  {tipo.nombre_tipo}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="form-actions">
            <Space size="middle">
              <Button
                onClick={handleCloseModal}
                size="large"
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {editingProgram ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProgramsContent;