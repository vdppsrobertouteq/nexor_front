// File: frontend/src/pages/Superadministrador/SuperAdminUsuarios/SuperAdminUsuariosContent.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Popconfirm,
  message,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  Avatar,
  Divider
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import './SuperAdminUsuariosContent.css';
import userService from '../../../services/userService';

const { Title, Text } = Typography;
const { Option } = Select;

const SuperAdminUsuariosContent = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);

  // Nuevos estados para paginación y filtros
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true
  });
  const [filters, setFilters] = useState({
    search: '',
    rol: null,
    activo: null
  });

  const cargarDatos = async (page = 1, pageSize = 10, currentFilters = filters) => {
    setLoading(true);
    try {
      const response = await userService.getUsers(page, pageSize, {
        search: currentFilters.search,
        rol: currentFilters.rol,
        activo: currentFilters.activo
      });

      setUsuarios(response.data);
      setPagination(prev => ({
        ...prev,
        current: response.pagination.currentPage,
        pageSize: response.pagination.itemsPerPage,
        total: response.pagination.totalItems
      }));

      // Cargar roles si no están cargados
      if (roles.length === 0) {
        const rolesResponse = await userService.getRoles();
        setRoles(rolesResponse.data);
      }
    } catch (error) {
      message.error(error.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // useEffect para manejar filtros y búsqueda
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      const newFilters = {
        ...filters,
        search: searchText
      };
      setFilters(newFilters);
      cargarDatos(1, pagination.pageSize, newFilters);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(delayedSearch);
  }, [searchText]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAgregarUsuario = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ activo: true });
    setModalVisible(true);
  };

  const handleEditarUsuario = (usuario) => {
    setEditingUser(usuario);
    form.setFieldsValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      id_rol: usuario.id_rol,
      activo: usuario.activo
    });
    setModalVisible(true);
  };

  const handleEliminarUsuario = async (id) => {
    try {
      setLoading(true);
      await userService.deleteUser(id);
      message.success('Usuario eliminado correctamente');
      cargarDatos(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.message || 'Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await userService.toggleUserStatus(id, !currentStatus);
      message.success(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      cargarDatos(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleChangePassword = async (userId, newPassword) => {
    try {
      await userService.changeUserPassword(userId, newPassword);
      message.success('Contraseña actualizada correctamente');
    } catch (error) {
      message.error(error.message || 'Error al cambiar contraseña');
    }
  };

  const handleSubmitForm = async (values) => {
    try {
      setLoading(true);

      if (editingUser) {
        const { newPassword, ...userData } = values;

        // Actualizar usuario
        await userService.updateUser(editingUser.id, userData);
        message.success('Usuario actualizado correctamente');

        // Si se proporcionó una nueva contraseña, cambiarla
        if (newPassword) {
          await handleChangePassword(editingUser.id, newPassword);
        }
      } else {
        // Crear nuevo usuario
        await userService.createUser(values);
        message.success('Usuario creado correctamente');
      }

      setModalVisible(false);
      form.resetFields();
      cargarDatos(pagination.current, pagination.pageSize);
    } catch (error) {
      // Si el backend retorna un mensaje específico para el email duplicado
      const mensaje = error?.response?.data?.message || error.message || 'Error al guardar el usuario';

      if (mensaje.toLowerCase().includes('email') && mensaje.toLowerCase().includes('registrado')) {
        form.setFields([
          {
            name: 'email',
            errors: ['Este correo electrónico ya está en uso. Intenta con otro.']
          }
        ]);
      } else {
        message.error(mensaje);
      }
    } finally {
      setLoading(false);
    }

  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
      responsive: ['md']
    },
    {
      title: 'Usuario',
      key: 'usuario',
      width: 200,
      render: (_, record) => (
        <div className="user-info">
          <div className="user-details">
            <Text strong className="user-name">
              {record.nombre} {record.apellido}
            </Text>
            <div className="user-email">
              <MailOutlined className="email-icon" />
              <Text type="secondary">{record.email}</Text>
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
    },
    {
      title: 'Rol',
      dataIndex: 'id_rol',
      key: 'id_rol',
      width: 120,
      render: (id_rol) => {
        const rol = roles.find(r => r.id === id_rol);
        const nombreRol = rol?.nombre_rol || 'Desconocido';
        const color = {
          'Administrador': 'red',
          'Colaborador': 'blue',
          'Cliente': 'green'
        }[nombreRol] || 'default';
        return <Tag color={color}>{nombreRol}</Tag>;
      },
      sorter: (a, b) => {
        const rolA = roles.find(r => r.id === a.id_rol)?.nombre_rol || '';
        const rolB = roles.find(r => r.id === b.id_rol)?.nombre_rol || '';
        return rolA.localeCompare(rolB);
      },
      responsive: ['sm']
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 140,
      render: (telefono) => (
        <div className="phone-info">
          <PhoneOutlined className="phone-icon" />
          <Text>{telefono}</Text>
        </div>
      ),
      responsive: ['lg']
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 100,
      render: (activo, record) => (
        <Switch
          checked={activo}
          onChange={() => handleToggleStatus(record.id, activo)}
          checkedChildren="Activo"
          unCheckedChildren="Inactivo"
          size="small"
        />
      ),
      sorter: (a, b) => a.activo - b.activo,
      responsive: ['md']
    },
    {
      title: 'Registro',
      dataIndex: 'fecha_registro',
      key: 'fecha_registro',
      width: 140,
      render: (fecha) => (
        <div className="date-info">
          <CalendarOutlined className="date-icon" />
          <Text>{formatearFecha(fecha)}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro),
      responsive: ['xl']
    },
    {
      title: 'Última Sesión',
      dataIndex: 'ultima_sesion',
      key: 'ultima_sesion',
      width: 140,
      render: (fecha) => (
        <div className="date-info">
          <ClockCircleOutlined className="date-icon" />
          <Text>{fecha ? formatearFecha(fecha) : 'Nunca'}</Text>
        </div>
      ),
      sorter: (a, b) => {
        if (!a.ultima_sesion) return -1;
        if (!b.ultima_sesion) return 1;
        return new Date(a.ultima_sesion) - new Date(b.ultima_sesion);
      },
      responsive: ['xl']
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar usuario">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditarUsuario(record)}
              className="edit-btn"
            />
          </Tooltip>
          <Tooltip title="Eliminar usuario">
            <Popconfirm
              title="¿Estás seguro de eliminar este usuario?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => handleEliminarUsuario(record.id)}
              okText="Sí"
              cancelText="No"
              okType="danger"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="delete-btn"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const usuariosFiltrados = usuarios.filter(user => {
    const rolUsuario = roles.find(r => r.id === user.id_rol);
    return rolUsuario?.nombre_rol !== 'Superadministrador';
  });


  return (
    <div className="admin-usuarios-container">
      <Card className="usuarios-card">
        <div className="header-section">
          <Title level={2} className="page-title">
            <UserOutlined className="title-icon" />
            Gestión de Usuarios
          </Title>
          <Text type="secondary" className="page-subtitle">
            Administra los usuarios del sistema
          </Text>
        </div>

        <Divider />

        <div className="actions-section">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Buscar usuarios..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => cargarDatos(pagination.current, pagination.pageSize)}
                loading={loading}
                className="refresh-btn"
              >
                Actualizar
              </Button>
            </Col>
            <Col xs={24} sm={24} md={8} lg={12} className="add-user-col">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleAgregarUsuario}
                className="add-user-btn"
                size="large"
              >
                Agregar Usuario
              </Button>
            </Col>
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={usuariosFiltrados}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} usuarios`,
              responsive: true,
              onChange: (page, pageSize) => {
                cargarDatos(page, pageSize);
              },
              onShowSizeChange: (current, size) => {
                cargarDatos(1, size);
              }
            }}
            scroll={{ x: 1200 }}
            className="usuarios-table"
            size="middle"
          />
        </div>
      </Card>

      <Modal
        title={
          <div className="modal-header">
            <UserOutlined className="modal-icon" />
            <span>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="usuario-modal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitForm}
          scrollToFirstError
          className="usuario-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nombre"
                name="nombre"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                  { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                ]}
              >
                <Input placeholder="Ingresa el nombre" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Apellido"
                name="apellido"
                rules={[
                  { required: true, message: 'El apellido es requerido' },
                  { min: 2, message: 'El apellido debe tener al menos 2 caracteres' }
                ]}
              >
                <Input placeholder="Ingresa el apellido" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Correo Electrónico"
            name="email"
            rules={[
              { required: true, message: 'El email es requerido' },
              { type: 'email', message: 'Ingresa un email válido' },
              {
                pattern: /^\S+$/,
                message: 'No se permiten espacios'
              }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="ejemplo@email.com"
              onKeyDown={(e) => {
                if (e.key === ' ') e.preventDefault();
              }}
            />
          </Form.Item>


          {!editingUser && (
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: 'La contraseña es requerida' },
                { min: 8, message: 'Debe tener al menos 8 caracteres' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Debe contener mayúscula, minúscula y número'
                },
                {
                  pattern: /^\S+$/,
                  message: 'No se permiten espacios'
                }
              ]}
            >
              <Input.Password
                placeholder="Ingresa la contraseña"
                onKeyDown={(e) => {
                  if (e.key === ' ') e.preventDefault();
                }}
              />
            </Form.Item>

          )}

          {editingUser && (
            <Form.Item
              label="Nueva Contraseña"
              name="newPassword"
              rules={[
                {
                  min: 8,
                  message: 'Debe tener al menos 8 caracteres'
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Debe contener mayúscula, minúscula y número'
                },
                {
                  pattern: /^\S*$/,
                  message: 'No se permiten espacios'
                }
              ]}
            >
              <Input.Password
                placeholder="Dejar vacío si no deseas cambiarla"
                onKeyDown={(e) => {
                  if (e.key === ' ') e.preventDefault();
                }}
              />
            </Form.Item>

          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Teléfono"
                name="telefono"
                rules={[
                  { required: true, message: 'El teléfono es requerido' },
                  {
                    pattern: /^\d{10}$/,
                    message: 'El teléfono debe tener exactamente 10 dígitos numéricos'
                  },
                  {
                    pattern: /^\S+$/,
                    message: 'No se permiten espacios'
                  }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Ej. 4421234567"
                  maxLength={10}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Rol"
                name="id_rol"
                rules={[
                  { required: true, message: 'El rol es requerido' }
                ]}
              >
                <Select placeholder="Selecciona un rol">
                  {roles.map(rol => (
                    <Option key={rol.id} value={rol.id}>
                      {rol.nombre_rol}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Estado de la cuenta"
            name="activo"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Activo"
              unCheckedChildren="Inactivo"
              className="status-switch"
            />
          </Form.Item>

          <div className="modal-actions">
            <Button
              onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}
              className="cancel-btn"
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-btn"
            >
              {editingUser ? 'Actualizar' : 'Agregar'} Usuario
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminUsuariosContent;