import React, { useState, useEffect } from 'react';
import {
    Card, Button, Tag, Avatar, Empty, Row, Col, Typography, Space, Tooltip, Spin, Progress
} from 'antd';
import {
    FileTextOutlined, CalendarOutlined,
    FlagOutlined, AlertOutlined, UserOutlined, UsergroupAddOutlined
} from '@ant-design/icons';
import {
    DndContext, closestCorners, PointerSensor, KeyboardSensor,
    useSensor, useSensors, DragOverlay, useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import useAuth from '../../../contexts/useAuth';
import userTaskService from '../../../services/userTaskService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './ClientTasksContent.css';

const { Title, Text } = Typography;

const STATUSES = [
    { label: "Pendiente", value: "Pendiente" },
    { label: "En Proceso", value: "En Proceso" },
    { label: "Completada", value: "Completada" }
];

// --- Draggable Task Card ---
const DraggableTaskCard = ({
    task,
    listeners,
    attributes,
    setNodeRef,
    isDragging,
    style,
    user
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

    // Distintivo "Tu tarea"
    const isMine = user && user.nombre_rol === 'Colaborador' && String(task.id_usuario_asignado) === String(user.id);

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
            >
                <div className="task-header">
                    <Title level={5} className="task-title" style={{ display: 'inline-block' }}>{task.nombre}</Title>
                    {(isOverdue || isDueSoon) && (
                        <AlertOutlined
                            style={{
                                color: isOverdue ? '#ff4d4f' : '#faad14',
                                fontSize: '16px',
                                marginLeft: 8
                            }}
                        />
                    )}
                    {isMine && (
                        <span className="my-task-label">
                            <UserOutlined className="my-task-icon" />
                            Tu tarea
                        </span>
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
const SortableTaskCard = ({ task, isDraggingTask, user }) => {
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
            listeners={listeners}
            attributes={attributes}
            setNodeRef={setNodeRef}
            isDragging={isDraggingTask || isDragging}
            style={style}
            user={user}
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

const ClientTasksContent = ({ project: propProject }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Soporte para obtener el proyecto actual seleccionado
    const [project, setProject] = useState(() => {
        if (propProject) return propProject;
        const stored = sessionStorage.getItem('selectedProject');
        return stored ? JSON.parse(stored) : null;
    });

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [progressIcon, setProgressIcon] = useState('😟');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Cargar tareas del proyecto ---
    const fetchTasks = async () => {
        if (!project?.id) return;
        setLoading(true);
        try {
            const response = await userTaskService.getProjectTasks(project.id);
            setTasks((response.data || []).map(task => ({
                ...task,
                prioridad: task.prioridad || task.nivel_prioridad,
                nivelRiesgo: task.nivelRiesgo || task.nivel_riesgo,
                faseCicloVida: task.faseCicloVida || task.fase_ciclo_vida,
                fechaInicio: task.fechaInicio || task.fecha_inicio,
                fechaVencimiento: task.fechaVencimiento || task.fecha_vencimiento,
                usuarioAsignado: task.usuarioAsignado || task.usuario_asignado_nombre,
                creador: task.creador || task.creador_nombre,
            })));
        } catch (error) {
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToMeetings = () => {
        if (project) {
            sessionStorage.setItem('selectedProject', JSON.stringify(project));
            navigate('/dashboard/cliente/meetings', {
                state: { project } // navegación inmediata sin recarga
            });
        } else {
            message.warning('No hay proyecto seleccionado');
        }
    };

    // --- Navegar a documentos del proyecto ---
    const handleGoToDocuments = () => {
        if (project) {
            sessionStorage.setItem('selectedProject', JSON.stringify(project));
            navigate('/dashboard/cliente/documents', {
                state: { project } // navegación inmediata sin recarga
            });
        } else {
            message.warning('No hay proyecto seleccionado');
        }
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line
    }, [project?.id]);

    // Barra de progreso y emoji
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

    // --- Kanban helpers ---
    const tasksByStatus = STATUSES.reduce((acc, s) => {
        acc[s.value] = tasks.filter(task => task.estatus === s.value);
        return acc;
    }, {});

    const activeTask = tasks.find(t => t.id === activeTaskId);

    // --- Drag-and-drop handlers ---
    const handleDragStart = ({ active }) => {
        setActiveTaskId(active.id);
    };

    const handleDragEnd = async ({ active, over }) => {
        setActiveTaskId(null);

        if (!over) return;
        const activeTaskObj = tasks.find(t => t.id === active.id);
        if (!activeTaskObj) return;

        // Verifica si el usuario puede mover la tarea
        const canEdit =
            user &&
            (
                user.nombre_rol === 'Colaborador' &&
                String(activeTaskObj.id_usuario_asignado) === String(user.id)
            );

        // Si no puede editar, show sweetalert2 y no hacer nada
        if (!canEdit) {
            Swal.fire({
                icon: 'warning',
                title: 'Acción no permitida',
                text: 'Solo puedes modificar el estatus de tus propias tareas.',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        let newStatus = null;
        if (STATUSES.map(s => s.value).includes(over.id)) {
            newStatus = over.id;
        } else {
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) newStatus = overTask.estatus;
        }

        if (
            activeTaskObj &&
            newStatus &&
            activeTaskObj.estatus !== newStatus
        ) {
            // Cambia estatus en backend
            try {
                await userTaskService.changeTaskStatus(active.id, newStatus);
                fetchTasks();
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.message || 'No se pudo actualizar el estatus',
                });
            }
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
                                    isDraggingTask={activeTaskId === task.id}
                                    user={user}
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
                        onClick={handleGoToDocuments}
                        size="large"
                        className="documents-btn"
                    >
                        Documentos
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
                                listeners={{}}
                                attributes={{}}
                                setNodeRef={() => { }}
                                isDragging={true}
                                style={{
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
                                    opacity: 0.7
                                }}
                                user={user}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
};

export default ClientTasksContent;