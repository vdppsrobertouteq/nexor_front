// File: frontend/src/pages/Administrador/AdminMeetings/MeetingsContent.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  Space,
  message,
  Tooltip,
  Avatar,
  Popconfirm,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useAuth from '../../../contexts/useAuth';
import meetingService from '../../../services/meetingService';
import './MeetingsContent.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MeetingsContent = ({ projectName }) => {
  const { user, loading: userLoading } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [projectUsers, setProjectUsers] = useState([]);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  // Datos del proyecto desde sessionStorage
  const selectedProject = JSON.parse(sessionStorage.getItem('selectedProject') || '{}');
  const projectId = selectedProject.id;

  // Verificar si el usuario es administrador
  const isAdmin = user?.id_rol === 1 || user?.nombre_rol === 'Administrador';

  // Estados de reunión
  const meetingStatuses = [
    { value: 'agendada', label: 'Agendada', color: 'blue' },
    { value: 'reprogramada', label: 'Reprogramada', color: 'orange' },
    { value: 'cancelada', label: 'Cancelada', color: 'red' },
    { value: 'finalizada', label: 'Finalizada', color: 'green' }
  ];

  // Modos de reunión
  const meetingModes = [
    { value: 'virtual', label: 'Virtual', icon: <VideoCameraOutlined /> },
    { value: 'presencial', label: 'Presencial', icon: <EnvironmentOutlined /> },
    { value: 'hibrido', label: 'Híbrido', icon: <UserOutlined /> }
  ];

  // Deshabilitar fechas pasadas en el RangePicker
  const disabledDate = (current) => current && current < dayjs().startOf('day');

  const disabledRangeTime = (_, type) => {
    if (type === 'start') {
      const now = dayjs();
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(h => h < now.hour()),
        disabledMinutes: (selectedHour) =>
          selectedHour === now.hour()
            ? Array.from({ length: 60 }, (_, i) => i).filter(m => m < now.minute())
            : [],
      };
    }
    return {};
  };

  // Cargar reuniones, tipos y usuarios de proyecto
 // Cargar reuniones, tipos y usuarios de proyecto
  const fetchData = async () => {
    if (!projectId) {
      setLoading(false);
      setMeetings([]);
      return;
    }
    setLoading(true);
    try {
      // Obtener reuniones del proyecto
      const { data: meetingsResp } = await meetingService.getProjectMeetings(projectId);
      // Mapear fechas a dayjs y obtener ids
      const meetingsMapped = meetingsResp.map(m => ({
        ...m,
        fecha_inicio: dayjs(m.fecha_hora_inicio || m.fecha_inicio),
        fecha_fin: dayjs(m.fecha_hora_fin || m.fecha_fin),
        participantes: [], // Se llenarán después
        tipo: m.tipo_reunion || m.tipo,
        estatus: m.estatus,
        modo: m.modo,
        ubicacion: m.ubicacion,
        link_reunion: m.enlace_reunion || m.link_reunion
      }));

      // Obtener participantes para cada reunión usando getMeetingById
      const meetingsWithParticipants = await Promise.all(
        meetingsMapped.map(async meeting => {
          try {
            const { data } = await meetingService.getMeetingById(meeting.id);
            return { ...meeting, participantes: data.participantes || [] };
          } catch {
            return meeting; // Si falla, deja la lista vacía
          }
        })
      );
      setMeetings(meetingsWithParticipants);

      // Obtener usuarios del proyecto
      const { data: usersResp } = await meetingService.getProjectUsers(projectId);
      setProjectUsers(usersResp);

      // Obtener tipos de reunión
      const { data: typesResp } = await meetingService.getMeetingTypes();
      setMeetingTypes(
        typesResp.map(t => ({
          value: t.id,
          label: t.nombre_tipo,
          description: t.descripcion
        }))
      );
    } catch (err) {
      message.error(err.message || 'Error al cargar datos de reuniones');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [projectId, userLoading, user]);

  // Cuando se abre el modal para crear
  const handleCreateMeeting = () => {
    setEditingMeeting(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Cuando se edita una reunión
  const handleEditMeeting = async (meeting) => {
    setEditingMeeting(meeting);
    // Obtener reunión completa para participantes
    try {
      const { data } = await meetingService.getMeetingById(meeting.id);
      form.setFieldsValue({
        ...meeting,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_rango: [dayjs(data.fecha_hora_inicio), dayjs(data.fecha_hora_fin)],
        tipo: data.id_tipo_reunion || data.tipo, // Puede ser id o string
        estatus: data.estatus,
        modo: data.modo,
        ubicacion: data.ubicacion,
        link_reunion: data.enlace_reunion || meeting.link_reunion,
        participantes: (data.participantes || []).map(p => p.id)
      });
    } catch {
      message.error('Error al cargar reunión para editar');
    }
    setIsModalVisible(true);
  };

  // Eliminar reunión
  const handleDeleteMeeting = async (meetingId) => {
    setSaving(true);
    try {
      await meetingService.deleteMeeting(meetingId);
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      message.success('Reunión eliminada correctamente');
    } catch (err) {
      message.error(err.message || 'Error al eliminar reunión');
    }
    setSaving(false);
  };

  // Unirse a la reunión (abre enlace)
  const handleJoinMeeting = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      message.warning('No hay enlace disponible para esta reunión');
    }
  };

  // Crear o actualizar reunión desde modal
  const handleModalOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch (validationError) {
      // Ant Design lanza { errorFields } cuando hay campos inválidos
      const errorFields = validationError?.errorFields || [];
      if (errorFields.length > 0) {
        const firstError = errorFields[0]?.errors?.[0];
        message.error(firstError || 'Por favor completa todos los campos requeridos');
      } else {
        message.error('Por favor revisa los campos del formulario');
      }
      return;
    }

    setSaving(true);
    try {
      const [fecha_inicio, fecha_fin] = values.fecha_rango;

      const payload = {
        titulo: values.titulo,
        descripcion: values.descripcion,
        fecha_hora_inicio: fecha_inicio.toISOString(),
        fecha_hora_fin: fecha_fin.toISOString(),
        enlace_reunion: values.link_reunion,
        id_proyecto: projectId,
        id_tipo_reunion: values.tipo,
        modo: values.modo,
        estatus: values.estatus,
        ubicacion: (values.modo === 'presencial' || values.modo === 'hibrido') ? values.ubicacion : null,
        participantes: values.participantes || [],
      };

      if (editingMeeting) {
        await meetingService.updateMeeting(editingMeeting.id, payload);
        message.success('Reunión actualizada correctamente');
      } else {
        await meetingService.createMeeting(payload);
        message.success('Reunión creada correctamente');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Error al procesar reunión';
      message.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Helpers de display
  const getStatusColor = (status) => {
    const statusObj = meetingStatuses.find(s => s.value === status);
    return statusObj?.color || 'default';
  };

  const getMeetingTypeLabel = (type) => {
    const typeObj = meetingTypes.find(t => t.value === type || t.label === type);
    return typeObj?.label || type;
  };

  const getMeetingModeLabel = (mode) => {
    const modeObj = meetingModes.find(m => m.value === mode);
    return modeObj?.label || mode;
  };

  const getMeetingModeIcon = (mode) => {
    const modeObj = meetingModes.find(m => m.value === mode);
    return modeObj?.icon || <UserOutlined />;
  };

  if (userLoading || loading) {
    return <div className="meetings-loading"><Spin /> Cargando...</div>;
  }

  return (
    <div className="meetings-content">
      <div className="meetings-header">
        <Title level={2} className="meetings-title">
          Reuniones del proyecto: {projectName || selectedProject.nombre || 'Sin nombre'}
        </Title>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateMeeting}
            className="create-meeting-btn"
          >
            Crear Reunión
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]} className="meetings-grid">
        {meetings.length === 0 && (
          <Col span={24}><Text type="secondary">No hay reuniones registradas.</Text></Col>
        )}
        {meetings.map((meeting) => (
          <Col xs={24} sm={12} lg={12} xl={6} key={meeting.id}>
            <Card
              className="meeting-card"
              hoverable
              actions={[
                <Tooltip title="Unirse a la reunión" key="join">
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => handleJoinMeeting(meeting.link_reunion)}
                    className="join-btn"
                  />
                </Tooltip>,
                ...(isAdmin ? [
                  <Tooltip title="Editar reunión" key="edit">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditMeeting(meeting)}
                      className="edit-btn"
                    />
                  </Tooltip>,
                  <Popconfirm
                    title="¿Estás seguro de eliminar esta reunión?"
                    onConfirm={() => handleDeleteMeeting(meeting.id)}
                    okText="Sí"
                    cancelText="No"
                    key="delete"
                  >
                    <Tooltip title="Eliminar reunión">
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        className="delete-btn"
                        loading={saving}
                      />
                    </Tooltip>
                  </Popconfirm>
                ] : [])
              ]}
            >
              <div className="card-header">
                <Title level={4} className="meeting-title" ellipsis={{ rows: 2 }}>
                  {meeting.titulo}
                </Title>
                <Tag color={getStatusColor(meeting.estatus)} className="status-tag">
                  {meeting.estatus?.charAt(0).toUpperCase() + meeting.estatus?.slice(1)}
                </Tag>
              </div>

              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: 'más' }}
                className="meeting-description"
              >
                {meeting.descripcion}
              </Paragraph>

              <div className="meeting-info">
                <div className="info-row">
                  <CalendarOutlined className="info-icon" />
                  <Text className="info-text">
                    {meeting.fecha_inicio?.format('DD/MM/YYYY')}
                  </Text>
                </div>

                <div className="info-row">
                  <ClockCircleOutlined className="info-icon" />
                  <Text className="info-text">
                    {meeting.fecha_inicio?.format('HH:mm')} - {meeting.fecha_fin?.format('HH:mm')}
                  </Text>
                </div>

                <div className="info-row">
                  {getMeetingModeIcon(meeting.modo)}
                  <Text className="info-text">
                    {getMeetingModeLabel(meeting.modo)}
                  </Text>
                </div>

                <div className="info-row">
                  <Text className="info-label">Tipo:</Text>
                  <Text className="info-text">
                    {getMeetingTypeLabel(meeting.tipo)}
                  </Text>
                </div>

                {meeting.ubicacion && (
                  <div className="info-row">
                    <EnvironmentOutlined className="info-icon" />
                    <Text className="info-text" ellipsis>
                      {meeting.ubicacion}
                    </Text>
                  </div>
                )}

                <div className="participants-section">
                  <Text className="info-label">Participantes:</Text>
                  <Avatar.Group
                    maxCount={3}
                    maxPopoverTrigger="click"
                    size="small"
                    maxStyle={{
                      color: '#f56a00',
                      backgroundColor: '#fde3cf',
                    }}
                  >
                    {(meeting.participantes || []).map((participant) => (
                      <Tooltip title={`${participant.nombre} ${participant.apellido ? participant.apellido : ''}`} key={participant.id}>
                        <Avatar size="small">
                          {participant.nombre?.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal para crear/editar reunión */}
      <Modal
        title={editingMeeting ? 'Editar Reunión' : 'Nueva Reunión'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        className="meeting-modal"
        okButtonProps={{ loading: saving }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark
          scrollToFirstError
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="titulo"
                label="Título de la reunión"
                rules={[{ required: true, message: 'El título es obligatorio' }]}
              >
                <Input placeholder="Ingresa el título de la reunión" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="descripcion"
                label="Descripción"
                rules={[{ required: true, message: 'La descripción es obligatoria' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Describe el propósito y agenda de la reunión"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="fecha_rango"
                label="Fecha y hora"
                rules={[{ required: true, message: 'La fecha y hora son obligatorias' }]}
              >
                <RangePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder={['Inicio', 'Fin']}
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  disabledTime={disabledRangeTime}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="tipo"
                label="Tipo de reunión"
                rules={[{ required: true, message: 'El tipo es obligatorio' }]}
              >
                <Select placeholder="Selecciona el tipo">
                  {meetingTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {type.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="modo"
                label="Modo de reunión"
                rules={[{ required: true, message: 'El modo es obligatorio' }]}
              >
                <Select placeholder="Selecciona el modo">
                  {meetingModes.map(mode => (
                    <Option key={mode.value} value={mode.value}>
                      <Space>
                        {mode.icon}
                        {mode.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="estatus"
                label="Estado"
                rules={[{ required: true, message: 'El estado es obligatorio' }]}
              >
                <Select placeholder="Selecciona el estado">
                  {meetingStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.modo !== currentValues.modo
              }
            >
              {({ getFieldValue }) => {
                const modo = getFieldValue('modo');
                return (modo === 'presencial' || modo === 'hibrido') ? (
                  <Col span={24}>
                    <Form.Item
                      name="ubicacion"
                      label="Ubicación"
                      rules={[{ required: true, message: 'La ubicación es obligatoria' }]}
                    >
                      <Input placeholder="Ingresa la ubicación de la reunión" />
                    </Form.Item>
                  </Col>
                ) : null;
              }}
            </Form.Item>

            <Col span={24}>
              <Form.Item
                name="link_reunion"
                label="Enlace de la reunión"
                rules={[
                  { required: true, message: 'El enlace es obligatorio' },
                  { type: 'url', message: 'Debe ser una URL válida' }
                ]}
              >
                <Input placeholder="https://meet.google.com/abc-defg-hij" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="participantes"
                label="Participantes"
              >
                <Select
                  mode="multiple"
                  placeholder="Selecciona los participantes"
                  options={projectUsers.map(u => ({
                    value: u.id,
                    label: `${u.nombre} ${u.apellido ?? ''}`.trim()
                  }))}
                  optionFilterProp="label"
                  showSearch
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MeetingsContent;