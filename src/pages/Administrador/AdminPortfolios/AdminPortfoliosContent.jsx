// File: frontend/src/pages/Administrador/AdminPortfolios/AdminPortfoliosContent.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, Input, Button, Modal, Form, message,
  Popconfirm, Row, Col, Typography, Space, Empty, Pagination, Spin
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined, EditOutlined,
  DeleteOutlined, FolderOpenOutlined
} from '@ant-design/icons';
import './AdminPortfoliosContent.css';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../contexts/useAuth';
import portfolioService from '../../../services/portfolioService';

const { Title } = Typography;
const { TextArea } = Input;

const AdminPortfoliosContent = ({ onPortfolioSelect }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);

  // Cargar portafolios
  const loadPortfolios = async (page = 1, search = '') => {
    setPageLoading(true);
    try {
      const filters = search ? { search } : {};
      const response = await portfolioService.getPortfolios(page, pageSize, filters);

      setPortfolios(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setCurrentPage(page);
    } catch (error) {
      message.error(error.message || 'Error al cargar portafolios');
      setPortfolios([]);
    } finally {
      setPageLoading(false);
    }
  };

  // Efecto inicial
  useEffect(() => {
    loadPortfolios();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        loadPortfolios(1, searchTerm);
      } else {
        loadPortfolios(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Crear portafolio
  const handleCreatePortfolio = async (values) => {
    setLoading(true);
    try {
      const portfolioData = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        id_administrador: user.id_rol
      };

      await portfolioService.createPortfolio(portfolioData);
      message.success('Portafolio creado exitosamente');
      handleCloseModal();
      loadPortfolios(currentPage, searchTerm);
    } catch (error) {
      message.error(error.message || 'Error al crear el portafolio');
    } finally {
      setLoading(false);
    }
  };

  // Editar portafolio
  const handleEditPortfolio = async (portfolioId, values) => {
    setLoading(true);
    try {
      const updateData = {
        nombre: values.nombre,
        descripcion: values.descripcion
      };

      await portfolioService.updatePortfolio(portfolioId, updateData);
      message.success('Portafolio actualizado exitosamente');
      handleCloseModal();
      loadPortfolios(currentPage, searchTerm);
    } catch (error) {
      message.error(error.message || 'Error al actualizar el portafolio');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar portafolio
  const handleDeletePortfolio = async (portfolioId) => {
    try {
      await portfolioService.deletePortfolio(portfolioId);
      message.success('Portafolio eliminado exitosamente');

      // Si estamos en la última página y solo queda un elemento, ir a la página anterior
      const newTotal = totalItems - 1;
      const maxPage = Math.ceil(newTotal / pageSize);
      const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;

      loadPortfolios(targetPage, searchTerm);
    } catch (error) {
      message.error(error.message || 'Error al eliminar el portafolio');
    }
  };

  // Abrir portafolio (para futura navegación a programas)
  const handleOpenPortfolio = (portfolio) => {
    const portfolioData = {
      id: portfolio.id,
      nombre: portfolio.nombre,
      descripcion: portfolio.descripcion,
      id_administrador: portfolio.id_administrador
    };

    if (onPortfolioSelect) {
      onPortfolioSelect(portfolioData);
    } else {
      // Almacenar en sessionStorage para que AdminProgramsContent lo lea
      sessionStorage.setItem('selectedPortfolio', JSON.stringify(portfolioData));
      message.info(`Abriendo programas del portafolio: ${portfolio.nombre}`);
      // Navegar a la ruta de programas, por ejemplo, '/admin/programas'
      navigate(`/dashboard/admin/programs`); // <-- Aquí se produce la navegación
    }
  };

  // Cambio de página
  const handlePageChange = (page) => {
    loadPortfolios(page, searchTerm);
  };

  // Abrir modal para crear
  const handleOpenCreateModal = () => {
    setEditingPortfolio(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Abrir modal para editar
  const handleOpenEditModal = (portfolio) => {
    setEditingPortfolio(portfolio);
    form.setFieldsValue({
      nombre: portfolio.nombre,
      descripcion: portfolio.descripcion
    });
    setModalVisible(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingPortfolio(null);
    form.resetFields();
  };

  // Envío del formulario
  const handleFormSubmit = (values) => {
    if (editingPortfolio) {
      handleEditPortfolio(editingPortfolio.id, values);
    } else {
      handleCreatePortfolio(values);
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

  return (
    <div className="admin-portfolios-container">
      <div className="portfolios-header">
        <Title level={1} className="portfolios-title">
          Portafolios
        </Title>
      </div>

      <div className="portfolios-controls">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16} lg={18}>
            <Input
              placeholder="Buscar portafolios por nombre..."
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
              Crear Portafolio
            </Button>
          </Col>
        </Row>
      </div>

      <div className="portfolios-content">
        {pageLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : portfolios.length === 0 ? (
          <div className="empty-state">
            <Empty
              description={searchTerm ? "No se encontraron portafolios que coincidan con la búsqueda" : "No hay portafolios creados"}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <div className="portfolios-grid">
              <Row gutter={[24, 24]}>
                {portfolios.map((portfolio) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={portfolio.id}>
                    <Card
                      className="portfolio-card"
                      title={
                        <div className="card-title">
                          <span className={`portfolio-name ${portfolio.nombre.length > 40 ? 'marquee' : ''}`}>
                            {portfolio.nombre}
                          </span>
                        </div>
                      }
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleOpenEditModal(portfolio)}
                          className="action-button edit-button"
                          title="Editar portafolio"
                        >
                          Editar
                        </Button>,
                        <Button
                          key="open"
                          type="text"
                          icon={<FolderOpenOutlined />}
                          onClick={() => handleOpenPortfolio(portfolio)}
                          className="action-button open-button"
                          title="Abrir programas"
                        >
                          Abrir
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="¿Eliminar portafolio?"
                          description="Esta acción no se puede deshacer. ¿Estás seguro?"
                          onConfirm={() => handleDeletePortfolio(portfolio.id)}
                          okText="Sí, eliminar"
                          cancelText="Cancelar"
                          okType="danger"
                        >
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="action-button delete-button"
                            title="Eliminar portafolio"
                            danger
                          >
                            Eliminar
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <div className="card-content">
                        <p className="portfolio-description">
                          {portfolio.descripcion || 'Sin descripción'}
                        </p>
                        <div className="portfolio-date">
                          <strong>Creado:</strong> {formatDate(portfolio.fecha_creacion)}
                        </div>
                        {portfolio.administrador_nombre && (
                          <div className="portfolio-admin">
                            <strong>Administrador:</strong> {portfolio.administrador_nombre}
                          </div>
                        )}
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
                  showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} portafolios`}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para crear/editar portafolio */}
      <Modal
        title={editingPortfolio ? 'Editar Portafolio' : 'Crear Nuevo Portafolio'}
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
            label="Nombre del Portafolio"
            name="nombre"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre del portafolio' },
              { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              { max: 255, message: 'El nombre no puede exceder 255 caracteres' }
            ]}
          >
            <Input
              placeholder="Ingresa el nombre del portafolio"
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
              placeholder="Describe brevemente el contenido del portafolio"
              rows={4}
              showCount
              maxLength={1000}
            />
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
                {editingPortfolio ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPortfoliosContent;