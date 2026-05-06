// File: frontend/src/pages/Administrador/AdminDashboard/DashboardMetricsContent.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic,
  Table, List, Select, DatePicker,
  Spin, Tag, Badge, Typography, Space,
  Divider, Button, Avatar, message
} from 'antd';
import {
  PieChart, Pie,
  Cell, BarChart, Bar, XAxis,
  YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';
import {
  DashboardOutlined, ProjectOutlined,
  TeamOutlined, FileTextOutlined,
  CalendarOutlined, AlertOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, UserOutlined, WarningOutlined
} from '@ant-design/icons';
import './DashboardMetricsContent.css';
import dashboardService from '../../../services/dashboardService';
import projectService from '../../../services/projectService';
import useAuth from '../../../contexts/useAuth';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DashboardMetricsContent = () => {
  // Auth context
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Estados para los datos
  const [generalSummary, setGeneralSummary] = useState(null);
  const [projectsStatus, setProjectsStatus] = useState([]);
  const [projectsRisk, setProjectsRisk] = useState([]);
  const [projectsByPortfolio, setProjectsByPortfolio] = useState([]);
  const [tasksStatus, setTasksStatus] = useState([]);
  const [tasksPriority, setTasksPriority] = useState([]);
  const [projectsWithPendingTasks, setProjectsWithPendingTasks] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState({ total: 0, documents: [] });
  const [scheduledMeetings, setScheduledMeetings] = useState({ today: 0, week: 0, meetings: [] });
  const [documentsSignedStats, setDocumentsSignedStats] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  // KPIs
  const [kpis, setKpis] = useState(null);

  // Estados de carga
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingKpis, setLoadingKpis] = useState(true);

  // Estados de filtros
  const [selectedPortfolio, setSelectedPortfolio] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  // Cargar datos al montar el componente (cuando user existe y está autenticado)
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      loadDashboardData();
      loadKpis();
      loadAllProjects();
    }
    // eslint-disable-next-line
  }, [authLoading, isAuthenticated, user]);

  // Recargar tareas filtradas y docs firmados al cambiar proyecto seleccionado
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      reloadFilteredCharts();
    }
    // eslint-disable-next-line
  }, [selectedProject]);

  const loadAllProjects = async () => {
    try {
      const res = await projectService.getProjects(1, 500);
      const list = res.data?.projects || res.data || [];
      setAllProjects(list);
    } catch (_) {
      // silently fail — filter will just be empty
    }
  };

  const reloadFilteredCharts = async () => {
    try {
      const projectId = selectedProject !== 'all' ? selectedProject : null;
      const [tasksStatusRes, docsStatsRes] = await Promise.all([
        dashboardService.getTasksStatusDistribution(projectId),
        dashboardService.getDocumentsSignedStats(projectId)
      ]);
      const taskStatusColors = { Pendiente: '#faad14', 'En Proceso': '#1890ff', Completada: '#52c41a' };
      setTasksStatus((tasksStatusRes.data || []).map(t => ({
        name: t.estatus, value: t.cantidad, color: taskStatusColors[t.estatus] || '#8884d8'
      })));
      setDocumentsSignedStats(docsStatsRes.data || null);
    } catch (_) {
      // silently fail
    }
  };

  // Función para cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    setLoadingSummary(true);
    setLoadingCharts(true);
    setLoadingTables(true);
    try {
      // 1. Resumen general
      const summaryRes = await dashboardService.getGeneralSummary();
      setGeneralSummary({
        totalPortfolios: summaryRes.data?.portfolios || 0,
        totalPrograms: summaryRes.data?.programs || 0,
        totalProjects: summaryRes.data?.projects || 0,
        totalTasks: summaryRes.data?.tasks || 0,
        collaboratingUsers: summaryRes.data?.collaborators || 0,
        totalUsers: summaryRes.data?.users || 0
      });
      setLoadingSummary(false);

      // 2. Gráficos principales
      const [
        statusRes,
        riskRes,
        portfolioRes,
        tasksStatusRes,
        tasksPriorityRes,
        docsStatsRes
      ] = await Promise.all([
        dashboardService.getProjectsStatusDistribution(),
        dashboardService.getProjectsRiskDistribution(),
        dashboardService.getProjectsByPortfolio(),
        dashboardService.getTasksStatusDistribution(selectedProject !== 'all' ? selectedProject : null),
        dashboardService.getTasksPriorityDistribution(),
        dashboardService.getDocumentsSignedStats(selectedProject !== 'all' ? selectedProject : null)
      ]);
      setDocumentsSignedStats(docsStatsRes.data || null);

      // Estado de proyectos (pastel)
      const statusMap = {
        Activo: { name: 'Activos', color: '#52c41a' },
        Finalizado: { name: 'Finalizados', color: '#1890ff' },
        Cancelado: { name: 'Cancelados', color: '#ff4d4f' }
      };
      setProjectsStatus((statusRes.data || []).map(s => ({
        name: statusMap[s.estatus]?.name || s.estatus,
        value: s.cantidad,
        color: statusMap[s.estatus]?.color || '#8884d8'
      })));

      // Riesgo de proyectos (radar)
      const riskColors = {
        Nulo: '#52c41a',
        Bajo: '#faad14',
        Medio: '#ff7a45',
        Alto: '#ff4d4f'
      };
      setProjectsRisk((riskRes.data || []).map(r => ({
        risk: r.nivel_riesgo,
        count: r.cantidad,
        color: riskColors[r.nivel_riesgo] || '#8884d8'
      })));

      // Proyectos por portafolio (barras)
      setProjectsByPortfolio((portfolioRes.data || []).map(p => ({
        portfolio: p.portafolio,
        projects: p.cantidad_proyectos
      })));

      // Tareas por estado (pastel)
      const taskStatusColors = {
        Pendiente: '#faad14',
        'En Proceso': '#1890ff',
        Completada: '#52c41a'
      };
      setTasksStatus((tasksStatusRes.data || []).map(t => ({
        name: t.estatus,
        value: t.cantidad,
        color: taskStatusColors[t.estatus] || '#8884d8'
      })));

      // Prioridad de tareas (PieChart)
      const priorityColors = {
        Baja: '#52c41a',
        Media: '#faad14',
        Alta: '#ff4d4f'
      };
      setTasksPriority((tasksPriorityRes.data || []).map(p => ({
        name: p.nivel_prioridad,
        value: p.cantidad,
        color: priorityColors[p.nivel_prioridad] || '#8884d8'
      })));

      setLoadingCharts(false);

      // 3. Tablas y listas (tareas pendientes, documentos, reuniones)
      const [
        pendingTasksProjectsRes,
        documentsRes,
        meetingsRes
      ] = await Promise.all([
        dashboardService.getProjectsWithPendingTasks(),
        dashboardService.getPendingDocuments(),
        dashboardService.getScheduledMeetings('today') // o 'week'
      ]);

      // Tabla proyectos con tareas pendientes/riesgo
      setProjectsWithPendingTasks((pendingTasksProjectsRes.data || []).map(p => ({
        key: p.id || p.proyecto || Math.random(),
        project: p.proyecto,
        pendingTasks: p.tareas_pendientes,
        highRiskTasks: p.tareas_riesgo_alto,
        riskLevel: (p.riesgo_proyecto || '').toLowerCase()
      })));

      // Documentos pendientes de firma (sin límite de cantidad)
      setPendingDocuments({
        total: (documentsRes.data || []).length,
        documents: (documentsRes.data || []).map(d => ({
          id: d.id || d.nombre_documento,
          name: d.nombre_documento,
          type: d.tipo || 'General',
          dueDate: d.fecha_subida ? d.fecha_subida.split('T')[0] : undefined
        }))
      });

      // Reuniones agendadas (hoy y semana)
      setScheduledMeetings({
        today: Array.isArray(meetingsRes.data) ? meetingsRes.data.length : 0,
        week: 0, // Puedes hacer otra llamada para la semana si quieres más detalle
        meetings: (meetingsRes.data || []).map(m => ({
          id: m.id,
          title: m.titulo,
          time: m.fecha_hora_inicio ? m.fecha_hora_inicio.slice(11, 16) : '',
          participants: m.total_participantes || 0
        })).slice(0, 3)
      });

      setLoadingTables(false);

    } catch (error) {
      message.error(error.message || 'Error al cargar las métricas del dashboard');
      setLoadingSummary(false);
      setLoadingCharts(false);
      setLoadingTables(false);
    }
  };

  // Cargar KPIs por periodo (ejemplo: 30 días)
  const loadKpis = async (days = 30) => {
    setLoadingKpis(true);
    try {
      const res = await dashboardService.getKPIsByPeriod(days);
      setKpis(res.data || null);
    } catch (_) {
      setKpis(null);
    } finally {
      setLoadingKpis(false);
    }
  };

  // Configuración de columnas para la tabla de proyectos con tareas pendientes
  const projectsTableColumns = [
    {
      title: 'Proyecto',
      dataIndex: 'project',
      key: 'project',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Nº Tareas Pendientes',
      dataIndex: 'pendingTasks',
      key: 'pendingTasks',
      align: 'center',
      render: (count) => <Badge count={count} showZero color="#faad14" />
    },
    {
      title: 'Nº Tareas en Riesgo Alto',
      dataIndex: 'highRiskTasks',
      key: 'highRiskTasks',
      align: 'center',
      render: (count, record) => {
        const color = record.riskLevel === 'alto' ? '#ff4d4f' :
          record.riskLevel === 'medio' ? '#faad14' : '#52c41a';
        return <Badge count={count} showZero color={color} />;
      }
    },
    {
      title: 'Nivel de Riesgo',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      align: 'center',
      render: (level) => {
        const config = {
          alto: { color: 'error', icon: <ExclamationCircleOutlined /> },
          medio: { color: 'warning', icon: <AlertOutlined /> },
          bajo: { color: 'success', icon: <CheckCircleOutlined /> }
        };
        const { color, icon } = config[level] || { color: 'default', icon: null };
        return <Tag color={color} icon={icon}>{level?.toUpperCase() || ''}</Tag>;
      }
    }
  ];

  // Etiquetas personalizadas para los gráficos de pastel
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>No autenticado. Por favor, inicia sesión.</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2}>
          <DashboardOutlined /> Dashboard de Métricas
        </Title>

        {/* Filtros */}
        <div className="dashboard-filters">
          <Space wrap>
            <Select
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ minWidth: 200 }}
              placeholder="Filtrar por proyecto"
            >
              <Option value="all">Todos los proyectos</Option>
              {allProjects.map(p => (
                <Option key={p.id} value={p.id}>{p.nombre}</Option>
              ))}
            </Select>
            <Button type="primary" onClick={() => { loadDashboardData(); loadKpis(); }}>
              Actualizar
            </Button>
          </Space>
        </div>
      </div>

      {/* Resumen General */}
      <Row gutter={[16, 16]} className="summary-section">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="metric-card">
            <Spin spinning={loadingSummary}>
              <Statistic
                title="Total Portafolios"
                value={generalSummary?.totalPortfolios || 0}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Spin>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="metric-card">
            <Spin spinning={loadingSummary}>
              <Statistic
                title="Total Programas"
                value={generalSummary?.totalPrograms || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Spin>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="metric-card">
            <Spin spinning={loadingSummary}>
              <Statistic
                title="Total Proyectos"
                value={generalSummary?.totalProjects || 0}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Spin>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="metric-card">
            <Spin spinning={loadingSummary}>
              <Statistic
                title="Total Tareas"
                value={generalSummary?.totalTasks || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Spin>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="metric-card">
            <Spin spinning={loadingSummary}>
              <Statistic
                title="Usuarios Registrados"
                value={generalSummary?.totalUsers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Spin>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="metric-card">
            <Spin spinning={loadingSummary}>
              <Statistic
                title="Usuarios en Proyectos"
                value={generalSummary?.collaboratingUsers || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Spin>
          </Card>
        </Col>

        {/* KPIs */}
        <Col xs={24} lg={12}>
          <Card className="metric-card" title="KPIs últimos 30 días">
            <Spin spinning={loadingKpis}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Nuevos Proyectos"
                    value={kpis?.newProjects || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Tareas Completadas"
                    value={kpis?.completedTasks || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Docs. Firmados"
                    value={kpis?.signedDocuments || 0}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col span={12} style={{ marginTop: 12 }}>
                  <Statistic
                    title="Tareas Pendientes"
                    value={kpis?.pendingTasks || 0}
                    prefix={<AlertOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12} style={{ marginTop: 12 }}>
                  <Statistic
                    title="Tareas Vencidas"
                    value={kpis?.overdueTasks || 0}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Gráficos Principales */}
      <Row gutter={[16, 16]} className="charts-section">
        {/* Estado de Proyectos */}
        <Col xs={24} lg={12}>
          <Card title="Estado de Proyectos" className="chart-card">
            <Spin spinning={loadingCharts}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectsStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectsStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>

        {/* Nivel de Riesgo */}
        <Col xs={24} lg={12}>
          <Card title="Nivel de Riesgo de Proyectos" className="chart-card">
            <Spin spinning={loadingCharts}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={projectsRisk}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="risk" />
                  <PolarRadiusAxis angle={90} domain={[0, 50]} />
                  <Radar
                    name="Proyectos"
                    dataKey="count"
                    stroke="#1890ff"
                    fill="#1890ff"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>

        {/* Proyectos por Portafolio */}
        <Col xs={24} lg={12}>
          <Card title="Proyectos por Portafolio" className="chart-card">
            <Spin spinning={loadingCharts}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectsByPortfolio}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="portfolio" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projects" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>

        {/* Tareas por Estado */}
        <Col xs={24} lg={12}>
          <Card title="Distribución de Tareas por Estado" className="chart-card">
            <Spin spinning={loadingCharts}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tasksStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksStatus.map((entry, index) => (
                      <Cell key={`cell-task-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>

        {/* Prioridad de Tareas - PieChart */}
        <Col xs={24} lg={12}>
          <Card title="Distribución de Prioridad de Tareas" className="chart-card">
            <Spin spinning={loadingCharts}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tasksPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#faad14"
                    dataKey="value"
                  >
                    {tasksPriority.map((entry, index) => (
                      <Cell key={`cell-priority-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>

        {/* Documentos Firmados vs No Firmados */}
        <Col xs={24} lg={12}>
          <Card
            title="Documentos: Estado de Firma"
            className="chart-card"
            extra={<Tag color="blue">{selectedProject !== 'all' ? 'Proyecto filtrado' : 'Todos los proyectos'}</Tag>}
          >
            <Spin spinning={loadingCharts}>
              {documentsSignedStats ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Firmados', value: documentsSignedStats.firmados || 0, color: '#52c41a' },
                        { name: 'Pendientes', value: documentsSignedStats.pendientes || 0, color: '#faad14' },
                        { name: 'Rechazados', value: documentsSignedStats.rechazados || 0, color: '#ff4d4f' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        { color: '#52c41a' },
                        { color: '#faad14' },
                        { color: '#ff4d4f' }
                      ].map((entry, index) => (
                        <Cell key={`cell-docs-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>Sin datos de documentos</div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Tablas y Listas */}
      <Row gutter={[16, 16]} className="tables-section">
        {/* Proyectos con Tareas Pendientes */}
        <Col xs={24} lg={16}>
          <Card title="Proyectos con Tareas Pendientes" className="table-card">
            <Spin spinning={loadingTables}>
              <Table
                columns={projectsTableColumns}
                dataSource={projectsWithPendingTasks}
                size="middle"
                pagination={false}
              />
            </Spin>
          </Card>
        </Col>

        {/* Panel Lateral */}
        <Col xs={24} lg={8}>
          {/* Documentos Pendientes */}
          <Card title="Documentos Pendientes de Firma" className="info-card" size="small">
            <Spin spinning={loadingTables}>
              <div className="pending-docs">
                <div className="docs-summary">
                  <Text strong style={{ fontSize: 24, color: '#ff4d4f' }}>
                    {pendingDocuments?.total || 0}
                  </Text>
                  <Text type="secondary"> documentos pendientes</Text>
                </div>
                <Divider />
                <List
                  size="small"
                  dataSource={pendingDocuments?.documents || []}
                  renderItem={(doc) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} size="small" />}
                        title={<Text ellipsis style={{ fontSize: 12 }}>{doc.name}</Text>}
                        description={
                          <Space>
                            <Tag color="blue" style={{ fontSize: 10 }}>{doc.type}</Tag>
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              Vence: {doc.dueDate}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Spin>
          </Card>

          {/* Reuniones Agendadas */}
          <Card title="Reuniones Agendadas" className="info-card" size="small" style={{ marginTop: 16 }}>
            <Spin spinning={loadingTables}>
              <div className="meetings-summary">
                <Row gutter={8}>
                  <Col span={12}>
                    <Statistic
                      title="Hoy"
                      value={scheduledMeetings?.today || 0}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#1890ff', fontSize: 18 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Esta Semana"
                      value={scheduledMeetings?.week || 0}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: 18 }}
                    />
                  </Col>
                </Row>
                <Divider />
                <List
                  size="small"
                  dataSource={scheduledMeetings?.meetings || []}
                  renderItem={(meeting) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<CalendarOutlined />} size="small" />}
                        title={<Text ellipsis style={{ fontSize: 12 }}>{meeting.title}</Text>}
                        description={
                          <Space>
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              {meeting.time}
                            </Text>
                            <Badge count={meeting.participants} color="#1890ff" style={{ fontSize: 8 }} />
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardMetricsContent;