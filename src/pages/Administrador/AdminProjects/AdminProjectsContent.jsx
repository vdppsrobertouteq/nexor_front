// File: frontend/src/pages/Administrador/AdminProjects/AdminProjectsContent.jsx
import React, { useState, useEffect } from 'react';
import {
    Card, Input, Button, Modal, Form, message,
    Popconfirm, Row, Col, Typography, Space, Empty,
    Pagination, Spin, Select, Transfer, Tooltip, Tag, Avatar
} from 'antd';
import {
    PlusOutlined, SearchOutlined, EditOutlined,
    DeleteOutlined, FolderOpenOutlined, UserOutlined,
    ExclamationCircleOutlined, CheckCircleOutlined,
    ClockCircleOutlined, StopOutlined
} from '@ant-design/icons';
import './AdminPortfoliosContent.css';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../contexts/useAuth';
import projectService from '../../../services/projectService';
import projectTypeService from '../../../services/projectTypeService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminProjectsContent = ({ selectedProgram, onProjectSelect }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [projectTypes, setProjectTypes] = useState([]);


    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(12);

    const handlePageChange = (page) => {
        loadProjects(page, searchTerm);
    };

    // Obtener programa desde sessionStorage si no se pasa como prop
    const getSelectedProgram = () => {
        if (selectedProgram) return selectedProgram;

        const stored = sessionStorage.getItem('selectedProgram');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing stored program:', error);
                return null;
            }
        }
        return null;
    };

    const program = getSelectedProgram();

    // Cargar proyectos del programa
    const loadProjects = async (page = 1, search = '') => {
        if (!program) {
            message.error('No hay programa seleccionado');
            setPageLoading(false);
            return;
        }

        setPageLoading(true);
        try {
            const filters = search ? { search, programa: program.id } : { programa: program.id };
            const response = await projectService.getProjects(page, pageSize, filters);

            setProjects(response.data || []);
            setTotalItems(response.pagination?.totalItems || 0);
            setCurrentPage(page);
        } catch (error) {
            message.error(error.message || 'Error al cargar proyectos');
            setProjects([]);
        } finally {
            setPageLoading(false);
        }
    };

    // Cargar usuarios disponibles
    const loadAvailableUsers = async () => {
        try {
            const response = await projectService.getAvailableUsers();
            setAvailableUsers(response.data || []);
        } catch (error) {
            message.error('Error al cargar usuarios disponibles');
        }
    };

    // Efecto inicial
    useEffect(() => {
        if (program) {
            loadProjects();
            loadAvailableUsers();
        } else {
            setPageLoading(false);
            message.warning('No se encontró información del programa seleccionado');
        }
    }, []);

    // Efecto de búsqueda con debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== '') {
                loadProjects(1, searchTerm);
            } else {
                loadProjects(1);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Carga los tipos de proyecto
    useEffect(() => {
        projectTypeService.getProjectTypes().then(setProjectTypes).catch(() => setProjectTypes([]));
    }, []);


    // Funciones de gestión de proyectos
    const handleCreateProject = async (values) => {
        setLoading(true);
        try {
            const projectData = {
                nombre: values.nombre,
                descripcion: values.descripcion,
                estatus: values.estatus,
                nivel_riesgo: values.nivel_riesgo,
                id_programa: program.id,
                id_administrador: user.id_rol,
                id_tipo_proyecto: program.id_tipo_proyecto_programa || null
            };

            const response = await projectService.createProject(projectData);
            const projectId = response.data.id;

            // Asignar usuarios seleccionados al proyecto con su rol real
            for (const userId of values.miembros || []) {
                // Buscar el usuario en availableUsers para obtener su id_rol
                const usuario = availableUsers.find(u => u.id === userId);
                const idRol = usuario?.id_rol || 3; // Si no se encuentra, por defecto colaborador
                await projectService.assignUserToProject(projectId, userId, idRol);
            }

            message.success('Proyecto creado exitosamente');
            handleCloseModal();
            loadProjects(currentPage, searchTerm);
        } catch (error) {
            message.error(error.message || 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };

    // Actualizar proyecto
    const handleEditProject = async (projectId, values) => {
        setLoading(true);
        try {
            await projectService.updateProject(projectId, values);

            // Obtener usuarios actuales del proyecto
            const currentUsers = await projectService.getProjectUsers(projectId);
            const currentUserIds = currentUsers.data.map(u => u.id_usuario);

            // Determinar usuarios a añadir y eliminar
            const nuevosMiembros = values.miembros || [];
            const usersToAdd = nuevosMiembros.filter(id => !currentUserIds.includes(id));
            const usersToRemove = currentUserIds.filter(id => !nuevosMiembros.includes(id));

            // Aplicar cambios en usuarios
            for (const userId of usersToAdd) {
                const usuario = availableUsers.find(u => u.id === userId);
                const idRol = usuario?.id_rol || 3;
                await projectService.assignUserToProject(projectId, userId, idRol);
            }
            for (const userId of usersToRemove) {
                await projectService.removeUserFromProject(projectId, userId);
            }

            message.success('Proyecto actualizado exitosamente');
            handleCloseModal();
            loadProjects(currentPage, searchTerm);
        } catch (error) {
            message.error(error.message || 'Error al actualizar el proyecto');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar proyecto
    const handleDeleteProject = async (projectId) => {
        try {
            await projectService.deleteProject(projectId);
            message.success('Proyecto eliminado exitosamente');

            const newTotal = totalItems - 1;
            const maxPage = Math.ceil(newTotal / pageSize);
            const targetPage = currentPage > maxPage ? Math.max(1, maxPage) : currentPage;

            loadProjects(targetPage, searchTerm);
        } catch (error) {
            message.error(error.message || 'Error al eliminar el proyecto');
        }
    };

    // Abrir proyecto (vista detallada)
    const handleOpenProject = (project) => {
        // Almacenar información del proyecto seleccionado
        const projectData = {
            id: project.id,
            nombre: project.nombre,
            descripcion: project.descripcion,
            estatus: project.estatus,
            nivel_riesgo: project.nivel_riesgo,
            id_programa: project.id_programa,
            programa_nombre: project.programa_nombre
        };

        console.log('Proyecto seleccionado:', projectData);

        if (onProjectSelect) {
            onProjectSelect(projectData);
        } else {
            sessionStorage.setItem('selectedProject', JSON.stringify(projectData));
            message.info(`Abriendo detalles del proyecto: ${project.nombre}`);
            navigate('/dashboard/admin/tasks');
        }
    };

    // Funciones de modal
    const handleOpenCreateModal = () => {
        setEditingProject(null);
        setSelectedUsers([]);
        form.resetFields();
        setModalVisible(true);
    };

    const handleOpenEditModal = async (project) => {
        setEditingProject(project);
        form.setFieldsValue({
            nombre: project.nombre,
            descripcion: project.descripcion,
            estatus: project.estatus,
            nivel_riesgo: project.nivel_riesgo,
            miembros: project.miembros ? project.miembros.map(miembro => miembro.id_usuario) : []
        });

        // Log para depurar los miembros del proyecto
        console.log("Abriendo modal de edición para el proyecto:", project.nombre);
        console.log("Miembros recibidos en el proyecto:", project.miembros);

        // Cargar usuarios asignados al proyecto desde los datos que ya tenemos
        if (project.miembros && project.miembros.length > 0) {
            const userIds = project.miembros.map(miembro => miembro.id_usuario);
            setSelectedUsers(userIds);
        } else {
            setSelectedUsers([]);
        }

        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingProject(null);
        setSelectedUsers([]);
        form.resetFields();
    };

    const handleFormSubmit = (values) => {
        if (editingProject) {
            handleEditProject(editingProject.id, values);
        } else {
            handleCreateProject(values);
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

    // Obtener color según estatus
    const getStatusColor = (status) => {
        const statusColors = {
            'Activo': 'green',
            'En Pausa': 'orange',
            'Completado': 'blue',
            'Cancelado': 'red'
        };
        return statusColors[status] || 'default';
    };

    // Obtener color según nivel de riesgo
    const getRiskColor = (risk) => {
        const riskColors = {
            'Bajo': 'green',
            'Medio': 'orange',
            'Alto': 'red',
            'Crítico': 'magenta'
        };
        return riskColors[risk] || 'default';
    };

    // Si no hay programa seleccionado
    if (!program) {
        return (
            <div className="admin-portfolios-container">
                <div className="empty-state">
                    <Empty
                        description="No hay programa seleccionado"
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
                    Proyectos
                </Title>
                <div className="portfolio-breadcrumb">
                    <Text type="secondary">
                        Programa: <strong>{program.nombre}</strong>
                    </Text>
                </div>
            </div>

            <div className="portfolios-controls">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={16} lg={18}>
                        <Input
                            placeholder="Buscar proyectos por nombre..."
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
                            Crear Proyecto
                        </Button>
                    </Col>
                </Row>
            </div>

            <div className="portfolios-content">
                {pageLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <Empty
                            description={searchTerm ? "No se encontraron proyectos que coincidan con la búsqueda" : "No hay proyectos creados en este programa"}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                ) : (
                    <>
                        <div className="portfolios-grid">
                            <Row gutter={[24, 24]}>
                                {projects.map((project) => (
                                    <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
                                        <Card
                                            className="portfolio-card"
                                            title={
                                                <div className="card-title">
                                                    <span className={`portfolio-name ${project.nombre.length > 40 ? 'marquee' : ''}`}>
                                                        {project.nombre}
                                                    </span>
                                                </div>
                                            }
                                            actions={[
                                                <Button
                                                    key="edit"
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleOpenEditModal(project)}
                                                    className="action-button edit-button"
                                                    title="Editar proyecto"
                                                >
                                                    Editar
                                                </Button>,
                                                <Button
                                                    key="open"
                                                    type="text"
                                                    icon={<FolderOpenOutlined />}
                                                    onClick={() => handleOpenProject(project)}
                                                    className="action-button open-button"
                                                    title="Abrir proyecto"
                                                >
                                                    Abrir
                                                </Button>,
                                                <Popconfirm
                                                    key="delete"
                                                    title="¿Eliminar proyecto?"
                                                    description="Esta acción no se puede deshacer. ¿Estás seguro?"
                                                    onConfirm={() => handleDeleteProject(project.id)}
                                                    okText="Sí, eliminar"
                                                    cancelText="Cancelar"
                                                    okType="danger"
                                                >
                                                    <Button
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        className="action-button delete-button"
                                                        title="Eliminar proyecto"
                                                        danger
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </Popconfirm>
                                            ]}
                                        >
                                            <div className="card-content">
                                                <p className="portfolio-description">
                                                    {project.descripcion || 'Sin descripción'}
                                                </p>
                                                <div className="project-status">
                                                    <Tag color={getStatusColor(project.estatus)}>
                                                        {project.estatus}
                                                    </Tag>
                                                    <Tag color={getRiskColor(project.nivel_riesgo)}>
                                                        Riesgo: {project.nivel_riesgo}
                                                    </Tag>
                                                </div>
                                                <div className="portfolio-date">
                                                    <strong>Creado:</strong> {formatDate(project.fecha_creacion)}
                                                </div>
                                                <div className="portfolio-admin">
                                                    <strong>Administrador:</strong> {project.administrador_nombre}
                                                </div>
                                                <div className="project-type">
                                                    <strong>Tipo de Proyecto:</strong> {project.tipo_proyecto || 'No definido'}
                                                </div>
                                                <div className="project-members">
                                                    <Title level={5} style={{ marginBottom: 8 }}>Miembros</Title>
                                                    {project.miembros?.length > 0 ? (
                                                        <div style={{ maxHeight: 100, overflowY: 'auto' }}>
                                                            {project.miembros.map((miembro) => (
                                                                <div key={miembro.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                                                    <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                                                                    <div>
                                                                        <Text strong>{miembro.nombre}</Text>
                                                                        <br />
                                                                        <Text type="secondary" style={{ fontSize: 12 }}>{miembro.rol}</Text>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <Text type="secondary">Sin miembros asignados</Text>
                                                    )}
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
                                    showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} proyectos`}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal para crear/editar proyecto */}
            <Modal
                title={editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                open={modalVisible}
                onCancel={handleCloseModal}
                footer={null}
                className="portfolio-modal"
                width={700}
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
                        label="Nombre del Proyecto"
                        name="nombre"
                        rules={[
                            { required: true, message: 'Por favor ingresa el nombre del proyecto' },
                            { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                            { max: 255, message: 'El nombre no puede exceder 255 caracteres' }
                        ]}
                    >
                        <Input
                            placeholder="Ingresa el nombre del proyecto"
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
                            placeholder="Describe brevemente el contenido del proyecto"
                            rows={4}
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Estatus"
                                name="estatus"
                                initialValue="Activo"
                                rules={[{ required: true, message: 'Por favor selecciona el estatus' }]}
                            >
                                <Select size="large">
                                    <Option value="Activo">Activo</Option>
                                    <Option value="Finalizado">Finalizado</Option>
                                    <Option value="Cancelado">Cancelado</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Nivel de Riesgo"
                                name="nivel_riesgo"
                                initialValue="Bajo"
                                rules={[{ required: true, message: 'Por favor selecciona el nivel de riesgo' }]}
                            >
                                <Select size="large">
                                    <Option value="Nulo">Nulo</Option>
                                    <Option value="Bajo">Bajo</Option>
                                    <Option value="Medio">Medio</Option>
                                    <Option value="Alto">Alto</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Miembros del Proyecto"
                        name="miembros"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Selecciona los usuarios"
                            optionFilterProp="label"
                            style={{ width: '100%' }}
                            showSearch
                        >
                            {availableUsers.map((user) => (
                                <Option key={user.id} value={user.id} label={`${user.nombre} ${user.apellido}`}>
                                    <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                                    {user.nombre} {user.apellido}
                                </Option>

                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Tipo de Proyecto">
                        <Input
                            value={program.tipo_proyecto_programa || 'No definido'}
                            disabled
                            readOnly
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
                                {editingProject ? 'Actualizar' : 'Crear'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProjectsContent;