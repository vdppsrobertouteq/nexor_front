// File: frontend/src/pages/Administrador/AdminTasks/AdminTasksContent.jsx
import React, { useState, useEffect } from 'react';
import {
    Card, Button, Modal, Form, Input,
    Select, DatePicker, Progress, Popconfirm,
    Tag, Avatar, Empty, message, Row,
    Col, Typography, Space, Tooltip, Spin
} from 'antd';
import { SearchOutlined, FilterOutlined, CloseCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import {
    PlusOutlined, FileTextOutlined,
    EditOutlined, DeleteOutlined,
    UserOutlined, CalendarOutlined,
    FlagOutlined, AlertOutlined, UsergroupAddOutlined
} from '@ant-design/icons';
import {
    DndContext, closestCorners, PointerSensor, KeyboardSensor,
    useSensor, useSensors, DragOverlay, useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import useAuth from '../../../contexts/useAuth';
import taskService from '../../../services/taskService';
import projectService from '../../../services/projectService';

import './AdminTasksContent.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const STATUSES = [
    { label: "Pendiente", value: "Pendiente" },
    { label: "En Proceso", value: "En Proceso" },
    { label: "Completada", value: "Completada" }
];

// --- Draggable Task Card ---
const DraggableTaskCard = ({
    task,
    onEdit,
    onDelete,
    listeners,
    attributes,
    setNodeRef,
    isDragging,
    style
}) => {
    const getPriorityColor = (priority) => {
        const colors = {
            'Baja': 'green',
            'Media': 'orange',
            'Alta': 'red'
        };
        return colors[priority] || 'default';
    };

    const getRiskColor = (risk) => {
        const colors = {
            'Nulo': 'default',
            'Bajo': 'blue',
            'Medio': 'orange',
            'Alto': 'red'
        };
        return colors[risk] || 'default';
    };

    const getLifecycleColor = (phase) => {
        const colors = {
            'Inicio': 'cyan',
            'Planeacion': 'blue',
            'Ejecucion': 'orange',
            'Monitoreo y Control': 'purple',
            'Cierre': 'green'
        };
        return colors[phase] || 'default';
    };

    const isOverdue = dayjs(task.fechaVencimiento).isBefore(dayjs(), 'day');
    const isDueSoon =
        dayjs(task.fechaVencimiento).diff(dayjs(), 'day') <= 3 && !isOverdue;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="draggable-task-card"
        >
            <div
                className="drag-handle-header"
                {...listeners}
                {...attributes}
                style={{
                    cursor: 'grab',
                    background: '#f5f5fa',
                    padding: '6px 12px',
                    borderRadius: '6px 6px 0 0',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 500,
                    fontSize: 13,
                    userSelect: 'none'
                }}
                onClick={e => e.stopPropagation()}
            >
                <span role="img" aria-label="mover">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="#888">
                        <circle cx="5" cy="7" r="1.5" />
                        <circle cx="5" cy="13" r="1.5" />
                        <circle cx="15" cy="7" r="1.5" />
                        <circle cx="15" cy="13" r="1.5" />
                    </svg>
                </span>
                Clic en esta área para mover tarea
            </div>
            <Card
                className={`task-card ${isDragging ? 'dragging' : ''}`}
                size="small"
                actions={[
                    <Tooltip title="Editar" key="edit">
                        <EditOutlined
                            onClick={e => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                        />
                    </Tooltip>,
                    <Popconfirm
                        title="¿Estás seguro de eliminar esta tarea?"
                        onConfirm={e => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Tooltip title="Eliminar">
                            <DeleteOutlined
                                key="delete"
                                onClick={e => e.stopPropagation()}
                            />
                        </Tooltip>
                    </Popconfirm>
                ]}
            >
                <div className="task-header">
                    <Title level={5} className="task-title">{task.nombre}</Title>
                    {(isOverdue || isDueSoon) && (
                        <AlertOutlined
                            style={{
                                color: isOverdue ? '#ff4d4f' : '#faad14',
                                fontSize: '16px'
                            }}
                        />
                    )}
                </div>
                <Text className="task-description" type="secondary">
                    {task.descripcion}
                </Text>
                <div className="task-tags">
                    <Tag color={getPriorityColor(task.prioridad)} icon={<FlagOutlined />}>
                        {task.prioridad}
                    </Tag>
                    <Tag color={getRiskColor(task.nivelRiesgo)}>
                        {task.nivelRiesgo}
                    </Tag>
                </div>
                <div className="task-lifecycle">
                    <Tag color={getLifecycleColor(task.faseCicloVida)}>
                        {task.faseCicloVida}
                    </Tag>
                </div>
                <div className="task-dates">
                    <div className="date-item">
                        <CalendarOutlined />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Inicio: {task.fechaInicio ? dayjs(task.fechaInicio).format('DD/MM/YYYY') : "--"}
                        </Text>
                    </div>
                    <div className="date-item">
                        <CalendarOutlined />
                        <Text
                            type={isOverdue ? 'danger' : isDueSoon ? 'warning' : 'secondary'}
                            style={{ fontSize: '12px' }}
                        >
                            Vence: {task.fechaVencimiento ? dayjs(task.fechaVencimiento).format('DD/MM/YYYY') : "--"}
                        </Text>
                    </div>
                </div>
                <div className="task-users">
                    <div className="user-info">
                        <Avatar size="small" icon={<UserOutlined />} />
                        <Text style={{ fontSize: '12px', marginLeft: '4px' }}>
                            {task.usuarioAsignado}
                        </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        Creado por: {task.creador}
                    </Text>
                </div>
            </Card>
        </div>
    );
};

// --- Sortable Wrapper for Dnd-kit ---
const SortableTaskCard = ({ task, onEdit, onDelete, isDraggingTask }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 2 : 1,
    };

    return (
        <DraggableTaskCard
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setNodeRef}
            isDragging={isDraggingTask || isDragging}
            style={style}
        />
    );
};

// --- DroppableColumn for empty columns to allow dropping ---
const DroppableColumn = ({ id, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            style={{
                minHeight: 120,
                background: isOver ? '#e6f7ff' : undefined,
                borderRadius: 8,
                transition: 'background 0.2s'
            }}
        >
            {children}
        </div>
    );
};

const AdminTasksContent = ({ project: propProject }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Soporte para obtener el proyecto actual seleccionado
    const [project, setProject] = useState(() => {
        if (propProject) return propProject;
        const stored = sessionStorage.getItem('selectedProject');
        return stored ? JSON.parse(stored) : null;
    });

    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form] = Form.useForm();
    const [progress, setProgress] = useState(0);
    const [progressIcon, setProgressIcon] = useState('\uD83D\uDE1F');
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [projectUsers, setProjectUsers] = useState([]);
    // Búsqueda y filtros del kanban
    const [searchText, setSearchText] = useState('');
    const [filterPriority, setFilterPriority] = useState(null);
    const [filterAssignee, setFilterAssignee] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Cargar usuarios del proyecto
    const fetchProjectUsers = async () => {
        if (!project?.id) return;
        try {
            const response = await projectService.getProjectUsers(project.id);
            setProjectUsers(response.data || []);
        } catch (error) {
            message.error(error.message);
        }
    };

    // Cargar tareas reales
    const fetchTasks = async () => {
        if (!project?.id) return;
        setLoading(true);
        try {
            const response = await taskService.getTasksByProject(project.id);
            // Mapear los campos aquí
            setTasks((response.data || []).map(task => ({
                ...task,
                prioridad: task.prioridad || task.nivel_prioridad,
                nivelRiesgo: task.nivelRiesgo || task.nivel_riesgo,
                faseCicloVida: task.faseCicloVida || task.fase_ciclo_vida,
                fechaInicio: task.fechaInicio || task.fecha_inicio,
                fechaVencimiento: task.fechaVencimiento || task.fecha_vencimiento,
                usuarioAsignado: task.usuarioAsignado || task.usuario_asignado_nombre,
                // etc.
            })));
        } catch (error) {
            message.error(error.message);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectUsers();
        fetchTasks();
        // eslint-disable-next-line
    }, [project?.id]);

    useEffect(() => {
        const newProgress = calculateProgress(tasks);
        setProgress(newProgress);
        setProgressIcon(getProgressIcon(newProgress));
    }, [tasks]);

    const calculateProgress = (taskList) => {
        if (taskList.length === 0) return 0;
        const completedTasks = taskList.filter(task => task.estatus === 'Completada');
        return Math.round((completedTasks.length / taskList.length) * 100);
    };

    const getProgressIcon = (progressValue) => {
        if (progressValue >= 76) return '😄';
        if (progressValue >= 51) return '😐';
        if (progressValue >= 26) return '😟';
        return '😠';
    };

    const getProgressColor = (progressValue) => {
        if (progressValue >= 76) return '#52c41a';
        if (progressValue >= 51) return '#fadb14';
        if (progressValue >= 26) return '#fa8c16';
        return '#ff4d4f';
    };

    // --- CRUD HANDLERS ---

    const handleCreateTask = async (taskData) => {
        if (!project?.id) return;
        try {
            await taskService.createTask(project.id, {
                ...taskData,
                usuarioAsignado: taskData.usuarioAsignado,
            });
            message.success('Tarea creada correctamente');
            setIsModalOpen(false);
            fetchTasks();
            form.resetFields();
        } catch (err) {
            message.error(err.message);
        }
    };

    const handleEditTask = async (taskId, updatedTaskData) => {
        if (!project?.id) return;
        try {
            await taskService.updateTask(project.id, taskId, {
                ...updatedTaskData,
                usuarioAsignado: updatedTaskData.usuarioAsignado,
            });
            message.success('Tarea actualizada correctamente');
            setIsModalOpen(false);
            setEditingTask(null);
            fetchTasks();
            form.resetFields();
        } catch (err) {
            message.error(err.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!project?.id) return;
        try {
            await taskService.deleteTask(project.id, taskId);
            message.success('Tarea eliminada correctamente');
            fetchTasks();
        } catch (err) {
            message.error(err.message);
        }
    };

    // --- Drag-and-drop ---

    // Aplicar filtros y búsqueda
    const filteredTasks = tasks.filter(task => {
        const matchSearch = !searchText ||
            task.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
            task.descripcion?.toLowerCase().includes(searchText.toLowerCase());
        const matchPriority = !filterPriority || task.prioridad === filterPriority;
        const matchAssignee = !filterAssignee || task.id_usuario_asignado === filterAssignee ||
            task.usuarioAsignadoId === filterAssignee;
        return matchSearch && matchPriority && matchAssignee;
    });
    const hasActiveFilters = searchText || filterPriority || filterAssignee;

    const exportToCSV = () => {
        const headers = ['Nombre', 'Descripción', 'Estado', 'Prioridad', 'Nivel de Riesgo', 'Fase del Ciclo de Vida', 'Fecha Inicio', 'Fecha Vencimiento', 'Asignado a', 'Creado por'];
        const rows = filteredTasks.map(t => [
            t.nombre ?? '',
            (t.descripcion ?? '').replace(/,/g, ';'),
            t.estatus ?? '',
            t.prioridad ?? '',
            t.nivelRiesgo ?? '',
            t.faseCicloVida ?? '',
            t.fechaInicio ? dayjs(t.fechaInicio).format('DD/MM/YYYY') : '',
            t.fechaVencimiento ? dayjs(t.fechaVencimiento).format('DD/MM/YYYY') : '',
            t.usuarioAsignado ?? '',
            t.creador ?? ''
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tareas_${project?.nombre ?? 'proyecto'}_${dayjs().format('YYYY-MM-DD')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const tasksByStatus = STATUSES.reduce((acc, s) => {
        acc[s.value] = filteredTasks.filter(task => task.estatus === s.value);
        return acc;
    }, {});

    const activeTask = tasks.find(t => t.id === activeTaskId);

    const handleDragStart = ({ active }) => {
        setActiveTaskId(active.id);
    };

    const handleDragEnd = async ({ active, over }) => {
        setActiveTaskId(null);
        if (!over) return;
        const activeTaskObj = tasks.find(t => t.id === active.id);

        let newStatus = null;
        if (STATUSES.map(s => s.value).includes(over.id)) {
            newStatus = over.id;
        } else {
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) newStatus = overTask.estatus;
        }

        if (activeTaskObj && newStatus && activeTaskObj.estatus !== newStatus) {
            // Actualizar en backend
            try {
                await taskService.updateTaskStatus(active.id, newStatus);
                fetchTasks();
                message.success(`Tarea movida a ${newStatus}`);
            } catch (err) {
                message.error(err.message);
            }
        } else if (activeTaskObj && newStatus && activeTaskObj.estatus === newStatus) {
            // Reordenamiento local en columna (opcional: podrías guardar nueva posición si agregas un campo "orden")
            // No persistente, reordenar solo en UI
        }
    };

    const openModal = (task = null) => {
        setEditingTask(task);
        if (task) {
            form.setFieldsValue({
                nombre: task.nombre,
                descripcion: task.descripcion,
                prioridad: task.prioridad || task.nivel_prioridad, // Corrige aquí
                estatus: task.estatus,
                nivelRiesgo: task.nivelRiesgo || task.nivel_riesgo,
                faseCicloVida: task.faseCicloVida || task.fase_ciclo_vida,
                fechaInicio: dayjs(task.fechaInicio || task.fecha_inicio),
                fechaVencimiento: dayjs(task.fechaVencimiento || task.fecha_vencimiento),
                usuarioAsignado: task.usuarioAsignadoId || task.id_usuario_asignado || (
                    projectUsers.find(u => (`${u.nombre} ${u.apellido}`) === task.usuarioAsignado)?.id_usuario
                ),
            });
        }
        setIsModalOpen(true);
    };

    const handleModalSubmit = (values) => {
        const formData = {
            ...values,
            fechaInicio: values.fechaInicio.format('YYYY-MM-DD'),
            fechaVencimiento: values.fechaVencimiento.format('YYYY-MM-DD'),
            usuarioAsignado: values.usuarioAsignado,
        };
        if (editingTask) {
            handleEditTask(editingTask.id, formData);
        } else {
            handleCreateTask(formData);
        }
    };

    // --- Navegación a documentos ---
    const handleGoToDocuments = () => {
        if (project) {
            sessionStorage.setItem('selectedProject', JSON.stringify(project));
            navigate('/dashboard/administrador/documents', {
                state: { project } // navegación inmediata sin recarga
            });
        } else {
            message.warning('No hay proyecto seleccionado');
        }
    };

    const handleGoToMeetings = () => {
        if (project) {
            sessionStorage.setItem('selectedProject', JSON.stringify(project));
            navigate('/dashboard/administrador/meetings', {
                state: { project } // navegación inmediata sin recarga
            });
        } else {
            message.warning('No hay proyecto seleccionado');
        }
    };

    // --- Renderiza cada columna ---
    const renderColumn = (title, status, columnTasks) => (
        <Col xs={24} sm={24} md={8} lg={8} xl={8} key={status}>
            <div className="kanban-column">
                <div className={`column-header ${status.toLowerCase().replace(' ', '-')}`}>
                    <Title level={4} className="column-title">
                        {title} ({columnTasks.length})
                    </Title>
                </div>
                <DroppableColumn id={status}>
                    <SortableContext
                        items={columnTasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {columnTasks.length === 0 ? (
                            <div
                                style={{
                                    minHeight: 96,
                                    border: '2px dashed #d9d9d9',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#fafafa',
                                    margin: '12px 0'
                                }}
                            >
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No hay tareas"
                                    style={{ margin: 0 }}
                                />
                            </div>
                        ) : (
                            columnTasks.map(task => (
                                <SortableTaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={openModal}
                                    onDelete={handleDeleteTask}
                                    isDraggingTask={activeTaskId === task.id}
                                />
                            ))
                        )}
                    </SortableContext>
                </DroppableColumn>
            </div>
        </Col>
    );

    if (!project) {
        return (
            <div style={{ padding: 48 }}>
                <Empty description="No hay proyecto seleccionado" />
            </div>
        );
    }

    return (
        <div className="admin-tasks-content">
            <div className="tasks-header">
                <Title level={2} className="main-title">
                    Tareas del proyecto '{project.nombre}'
                </Title>
                <Space className="action-buttons">
                    <Button
                        icon={<UsergroupAddOutlined />}
                        size="large"
                        className="documents-btn"
                        onClick={handleGoToMeetings}
                    >
                        Reuniones
                    </Button>
                    <Button
                        icon={<FileTextOutlined />}
                        size="large"
                        className="documents-btn"
                        onClick={handleGoToDocuments}
                    >
                        Documentos
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => openModal()}
                        className="create-task-btn"
                    >
                        Crear Tarea
                    </Button>
                </Space>
            </div>

            <div className="progress-section">
                <div className="progress-container">
                    <div className="progress-info">
                        <span className="progress-icon">{progressIcon}</span>
                        <div className="progress-text">
                            <Text strong>Progreso del Proyecto</Text>
                            <Text type="secondary"> - {progress}% completado</Text>
                        </div>
                    </div>
                    <Progress
                        percent={progress}
                        strokeColor={{
                            from: getProgressColor(0),
                            to: getProgressColor(progress),
                        }}
                        className="custom-progress"
                        size="large"
                    />
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Input
                    prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                    placeholder="Buscar tarea por nombre o descripción..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
                />
                <Select
                    placeholder={<span><FilterOutlined /> Prioridad</span>}
                    allowClear
                    value={filterPriority}
                    onChange={val => setFilterPriority(val)}
                    style={{ minWidth: 140 }}
                    options={[
                        { value: 'Alta', label: '🔴 Alta' },
                        { value: 'Media', label: '🟡 Media' },
                        { value: 'Baja', label: '🟢 Baja' },
                    ]}
                />
                <Select
                    placeholder={<span><FilterOutlined /> Asignado a</span>}
                    allowClear
                    value={filterAssignee}
                    onChange={val => setFilterAssignee(val)}
                    style={{ minWidth: 180 }}
                    showSearch
                    optionFilterProp="label"
                    options={projectUsers.map(u => ({
                        value: u.id_usuario || u.id,
                        label: `${u.nombre} ${u.apellido ?? ''}`.trim()
                    }))}
                />
                {hasActiveFilters && (
                    <Button
                        icon={<CloseCircleOutlined />}
                        onClick={() => { setSearchText(''); setFilterPriority(null); setFilterAssignee(null); }}
                        size="small"
                        type="text"
                        style={{ color: '#ff4d4f' }}
                    >
                        Limpiar filtros
                    </Button>
                )}
                {hasActiveFilters && (
                    <Tag color="blue" style={{ margin: 0 }}>
                        {filteredTasks.length} de {tasks.length} tareas
                    </Tag>
                )}
                <div style={{ marginLeft: 'auto' }}>
                    <Tooltip title="Exportar tareas visibles a CSV">
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={exportToCSV}
                            disabled={filteredTasks.length === 0}
                            size="small"
                        >
                            Exportar CSV
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', margin: '48px 0' }}><Spin size="large" /></div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="kanban-board">
                        <Row gutter={[16, 16]} className="kanban-columns">
                            {STATUSES.map(s =>
                                renderColumn(s.label, s.value, tasksByStatus[s.value] || [])
                            )}
                        </Row>
                    </div>
                    <DragOverlay>
                        {activeTask ? (
                            <DraggableTaskCard
                                task={activeTask}
                                onEdit={() => { }}
                                onDelete={() => { }}
                                listeners={{}}
                                attributes={{}}
                                setNodeRef={() => { }}
                                isDragging={true}
                                style={{
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
                                    opacity: 0.7
                                }}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            <Modal
                title={editingTask ? "Editar Tarea" : "Crear Nueva Tarea"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
                className="task-modal"
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleModalSubmit}
                    scrollToFirstError
                    initialValues={{
                        prioridad: 'Media',
                        estatus: 'Pendiente',
                        nivelRiesgo: 'Bajo',
                        faseCicloVida: 'Inicio'
                    }}
                >
                    <Form.Item
                        name="nombre"
                        label="Nombre de la Tarea"
                        rules={[{ required: true, message: 'El nombre es requerido' }]}
                    >
                        <Input placeholder="Ingrese el nombre de la tarea" />
                    </Form.Item>

                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'La descripción es requerida' }]}
                    >
                        <TextArea rows={3} placeholder="Describe la tarea en detalle" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="prioridad" label="Prioridad">
                                <Select>
                                    <Option value="Baja">Baja</Option>
                                    <Option value="Media">Media</Option>
                                    <Option value="Alta">Alta</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="estatus" label="Estatus">
                                <Select>
                                    <Option value="Pendiente">Pendiente</Option>
                                    <Option value="En Proceso">En Proceso</Option>
                                    <Option value="Completada">Completada</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="nivelRiesgo" label="Nivel de Riesgo">
                                <Select>
                                    <Option value="Nulo">Nulo</Option>
                                    <Option value="Bajo">Bajo</Option>
                                    <Option value="Medio">Medio</Option>
                                    <Option value="Alto">Alto</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="faseCicloVida" label="Fase del Ciclo de Vida">
                                <Select>
                                    <Option value="Inicio">Inicio</Option>
                                    <Option value="Planeacion">Planeación</Option>
                                    <Option value="Ejecucion">Ejecución</Option>
                                    <Option value="Monitoreo y Control">Monitoreo y Control</Option>
                                    <Option value="Cierre">Cierre</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fechaInicio"
                                label="Fecha de Inicio"
                                rules={[{ required: true, message: 'La fecha de inicio es requerida' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="fechaVencimiento"
                                label="Fecha de Vencimiento"
                                rules={[{ required: true, message: 'La fecha de vencimiento es requerida' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="usuarioAsignado"
                        label="Usuario Asignado"
                        rules={[{ required: true, message: 'Debe asignar un usuario' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Buscar y seleccionar usuario"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children?.[1] ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {projectUsers.map(user => (
                                <Option key={user.id_usuario} value={user.id_usuario}>
                                    <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                                    {user.nombre} {user.apellido}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item className="modal-buttons">
                        <Space>
                            <Button onClick={() => {
                                setIsModalOpen(false);
                                setEditingTask(null);
                                form.resetFields();
                            }}>
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingTask ? 'Guardar' : 'Crear'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminTasksContent;