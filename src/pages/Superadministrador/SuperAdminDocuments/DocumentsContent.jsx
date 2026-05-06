// File: frontend/src/pages/Colaborador/ColabDocuments/DocumentsContent.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Table, Modal, Button, Tag, Form, Input, Upload, Select,
  message, notification, Space, Typography, Row, Col, Divider,
  Tooltip, Progress, Card
} from 'antd';
import {
  EyeOutlined, HistoryOutlined, EditOutlined, CloseOutlined,
  UploadOutlined, FilterOutlined, FileTextOutlined,
  SignatureOutlined, DownloadOutlined, UserOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';
import documentService from '../../../services/documentService';
import useAuth from '../../../contexts/useAuth';
import './DocumentsContent.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// usar worker desde un archivo local
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const backendBaseUrl = "http://localhost:3000";

const DocumentsContent = ({ userRole: _userRole, userId: _userId, projectUsers: _projectUsers }) => {
  // Auth & Project
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [project, setProject] = useState(() => {
    const fromRoute = location.state?.project;
    const fromStorage = sessionStorage.getItem('selectedProject');
    return fromRoute || (fromStorage && JSON.parse(fromStorage)) || null;
  });

  // Estados principales
  const [documents, setDocuments] = useState([]);
  const [signedDocuments, setSignedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', name: '' });
  const [projectUsers, setProjectUsers] = useState(_projectUsers || []);
  const [versionHistory, setVersionHistory] = useState([]);
  const [selectedVersionDoc, setSelectedVersionDoc] = useState(null);

  // Modal states
  const [modals, setModals] = useState({
    upload: false,
    uploadVersion: false,
    masterList: false,
    pdfViewer: false,
    reject: false,
    versions: false
  });

  // PDF & Signature
  const [currentDocument, setCurrentDocument] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatureRef, setSignatureRef] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState({ x: 100, y: 100 });
  const [pdfLoadError, setPdfLoadError] = useState(null);

  // Para manejar click en PDF
  const pdfWrapperRef = useRef(null);
  const [pdfPageRendered, setPdfPageRendered] = useState(false);

  // Forms
  const [uploadForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [uploadVersionForm] = Form.useForm(); // NUEVO
  const [uploadVersionDocId, setUploadVersionDocId] = useState(null); // NUEVO

  // Helpers
  const isColaborador = user?.nombre_rol === 'Colaborador';
  const isAdmin = user?.nombre_rol === 'Administrador';
  const isCliente = user?.nombre_rol === 'Cliente';

  // --- Fetch Project Users (for assigning signers in upload) ---
  useEffect(() => {
    async function fetchUsers() {
      if (project?.id) {
        setLoading(true);
        try {
          const res = await documentService.getProjectUsers(project.id);
          setProjectUsers(res.data || []);
        } catch (e) {
          message.error(e.message);
        }
        setLoading(false);
      }
    }
    fetchUsers();
  }, [project?.id]);

  // --- Fetch Documents on mount and when project changes ---
  const fetchDocuments = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await documentService.getDocumentsByProject(project.id);
      setDocuments(res.data || []);
    } catch (e) {
      message.error(e.message);
    }
    setLoading(false);
  }, [project?.id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // --- Fetch Master List ---
  const fetchSignedDocuments = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await documentService.getListaMaestra(project.id);
      setSignedDocuments(res.data || []);
    } catch (e) {
      message.error(e.message);
    }
    setLoading(false);
  };

  // --- Table Data Filtering ---
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesStatus = !filters.status || doc.estatus === filters.status;
      const matchesName = !filters.name ||
        doc.nombre_documento.toLowerCase().includes(filters.name.toLowerCase());
      // Solo pendientes y rechazados
      return matchesStatus && matchesName && doc.estatus !== 'Firmado';
    });
  }, [documents, filters]);

  // --- Progress de Firmantes ---
  const fetchFirmantesProgress = (versionId) => {
    const doc = documents.find(d => d.version_id === versionId);
    if (!doc || !doc.firmantes) return { signed: 0, total: 0 };
    return { signed: doc.firmados || 0, total: doc.total_firmantes || 0 };
  };

  // --- Modals ---
  const openModal = (modalName, document = null) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (document) setCurrentDocument(document);
    if (modalName === 'versions' && document) {
      fetchVersionHistory(document.id);
      setSelectedVersionDoc(document);
    }
    if (modalName === 'masterList') {
      fetchSignedDocuments();
    }
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === 'versions') {
      setVersionHistory([]);
      setSelectedVersionDoc(null);
    }
    setCurrentDocument(null);
    setPdfFile(null);
    setPdfLoadError(null);
    setShowSignature(false);
    setSignaturePosition({ x: 100, y: 100 });
    uploadForm.resetFields();
    rejectForm.resetFields();
    setPdfPageRendered(false);
  };

  // Abre el modal de nueva versión y guarda el docId
  const openUploadVersionModal = (docId) => {
    setUploadVersionDocId(docId);
    setModals(prev => ({ ...prev, uploadVersion: true }));
  };
  const closeUploadVersionModal = () => {
    setModals(prev => ({ ...prev, uploadVersion: false }));
    setUploadVersionDocId(null);
    uploadVersionForm.resetFields();
  };

  // --- PDF Viewer/Signature ---
  const handleOpenPDFViewer = (document, showSign = false) => {
    setCurrentDocument(document);
    setPdfLoadError(null);

    // Si ruta_archivo ya es absoluta, úsala; si es relativa, concatena backendBaseUrl
    const pdfUrl = document.ruta_archivo.startsWith('http')
      ? document.ruta_archivo
      : `${backendBaseUrl}${document.ruta_archivo}`;

    setPdfFile(pdfUrl);
    setShowSignature(showSign);
    setPageNumber(1);
    setPdfPageRendered(false);
    openModal('pdfViewer');
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfLoadError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setPdfLoadError(error.message || 'Error al cargar el documento PDF');
    message.error('Error al cargar el documento PDF. Verifique que el archivo existe y es válido.');
  };

  // Para centrar y permitir click en el PDF
  const handlePDFPageRenderSuccess = () => {
    setPdfPageRendered(true);
  };

  // Detecta click en PDF para colocar la firma
  const handlePdfClick = (e) => {
    if (!showSignature || !pdfWrapperRef.current) return;
    const rect = pdfWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pdfWidth = rect.width;
    const pdfHeight = rect.height;

    setSignaturePosition({
      x, y,
      xRatio: x / pdfWidth,
      yRatio: y / pdfHeight
    });
  };

  // --- Version history ---
  const fetchVersionHistory = async (documentId) => {
    setLoading(true);
    try {
      const res = await documentService.getVersionHistory(documentId);
      setVersionHistory(res.data || []);
    } catch (e) {
      message.error(e.message);
    }
    setLoading(false);
  };

  // --- Upload New Document ---
  const handleUploadNewDocument = async (values) => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre_documento', values.name);
      formData.append('id_proyecto', project.id);
      formData.append('firmantes', JSON.stringify(values.signers));
      if (values.comment) formData.append('cambios_realizados', values.comment);
      formData.append('documento', values.file.file);

      await documentService.uploadDocument(formData);
      message.success('Documento subido exitosamente');
      closeModal('upload');
      fetchDocuments();
    } catch (e) {
      message.error(e.message);
    }
    setLoading(false);
  };

  // --- Upload New Version ---
  const handleUploadNewVersion = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id_documento', uploadVersionDocId);
      formData.append('cambios_realizados', values.comment || 'Nueva versión');
      formData.append('firmantes', JSON.stringify(values.signers));
      formData.append('documento', values.file.file);

      await documentService.uploadNewVersion(formData);
      message.success('Nueva versión subida exitosamente');
      closeUploadVersionModal();
      fetchDocuments();
    } catch (e) {
      message.error(e.message);
    }
    setLoading(false);
  };

  // --- Firmar Documento ---
  const handleSignDocument = async () => {
    if (!signatureRef || typeof signatureRef.isEmpty !== "function" || signatureRef.isEmpty()) {
      message.error('Por favor, dibuje su firma');
      return;
    }
    setLoading(true);

    try {
      // Usa getCanvas() para evitar errores de la librería
      const signatureDataURL = signatureRef.getCanvas().toDataURL('image/png');
      const blob = await (await fetch(signatureDataURL)).blob();
      const formData = new FormData();
      formData.append('firma', blob, `firma_${user.id}.png`);
      formData.append('xRatio', signaturePosition.xRatio);
      formData.append('yRatio', signaturePosition.yRatio);

      await documentService.signDocument(currentDocument.version_id, formData);
      message.success('Documento firmado exitosamente');
      closeModal('pdfViewer');
      fetchDocuments();
    } catch (error) {
      message.error(error?.message || "Error al firmar");
      console.error("Error al firmar documento", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Rechazar Documento ---
  const handleRejectDocument = async (values) => {
    setLoading(true);
    try {
      await documentService.rejectDocument(currentDocument.version_id, values.reason);
      message.success('Documento rechazado');
      closeModal('reject');
      fetchDocuments();
    } catch (e) {
      message.error(e.message);
    }
    setLoading(false);
  };

  // --- Render Table Columns ---
  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_documento',
      key: 'nombre_documento',
      ellipsis: true,
      sorter: (a, b) => a.nombre_documento.localeCompare(b.nombre_documento),
    },
    {
      title: 'Versión',
      dataIndex: 'numero_version',
      key: 'numero_version',
      width: 80,
      align: 'center',
      render: (version) => <Tag color="blue">v{version}</Tag>
    },
    {
      title: 'Subido por',
      dataIndex: 'subido_por',
      key: 'subido_por',
      width: 120,
      render: (user) => (
        <Space>
          <UserOutlined />
          {user}
        </Space>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_subida',
      key: 'fecha_subida',
      width: 110,
      sorter: (a, b) => new Date(a.fecha_subida) - new Date(b.fecha_subida),
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Estatus',
      dataIndex: 'estatus',
      key: 'estatus',
      width: 100,
      render: (status) => {
        const config = {
          'Pendiente': { color: 'orange', text: 'Pendiente' },
          'Rechazado': { color: 'red', text: 'Rechazado' },
          'Firmado': { color: 'green', text: 'Firmado' }
        };
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
      }
    },
    {
      title: 'Firmantes',
      key: 'signers',
      width: 120,
      render: (_, record) => {
        const progress = fetchFirmantesProgress(record.version_id);
        return (
          <Tooltip title={`${progress.signed} de ${progress.total} firmado(s)`}>
            <Progress
              percent={progress.total > 0 ? (progress.signed / progress.total) * 100 : 0}
              size="small"
              format={() => `${progress.signed}/${progress.total}`}
            />
          </Tooltip>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 220,
      render: (_, record) => {
        const isFirmante = record.puede_firmar;
        const hasFirmado = record.firmado === 1 || record.firmado === true;
        const canSign = (isColaborador || isAdmin || isCliente) &&
          record.estatus === 'Pendiente' &&
          isFirmante &&
          !hasFirmado;

        const canReject = canSign;
        const canUploadVersion = isColaborador &&
          record.estatus === 'Rechazado' &&
          record.subido_por === `${user.nombre} ${user.apellido}`;

        return (
          <Space size="small" wrap>
            <Tooltip title="Ver documento">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleOpenPDFViewer(record)}
                disabled={loading}
              />
            </Tooltip>

            <Tooltip title="Ver versiones">
              <Button
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => openModal('versions', record)}
                disabled={loading}
              />
            </Tooltip>

            {canSign && (
              <>
                <Tooltip title="Firmar">
                  <Button
                    size="small"
                    type="primary"
                    icon={<SignatureOutlined />}
                    onClick={() => handleOpenPDFViewer(record, true)}
                    disabled={loading}
                  />
                </Tooltip>

                <Tooltip title="Rechazar">
                  <Button
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => openModal('reject', record)}
                    disabled={loading}
                  />
                </Tooltip>
              </>
            )}

            {canUploadVersion && (
              <Tooltip title="Subir nueva versión">
                <Button
                  size="small"
                  type="primary"
                  icon={<UploadOutlined />}
                  disabled={loading}
                  onClick={() => openUploadVersionModal(record.id)}
                />
              </Tooltip>
            )}
          </Space>
        );
      }
    }
  ];

  // --- Render ---
  return (
    <div className="documents-content">
      {/* Encabezado */}
      <Row justify="space-between" align="middle" className="documents-header">
        <Col>
          <Title level={3}>
            <FileTextOutlined /> Documentos del Proyecto {project?.nombre || 'Seleccionado'}
          </Title>
        </Col>
        <Col>
          <Space wrap>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => openModal('masterList')}
              disabled={loading}
            >
              Lista Maestra
            </Button>
            {isColaborador && (
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => openModal('upload')}
                disabled={loading}
              >
                Subir Documento
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Filtros */}
      <Card size="small" className="filters-card">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filtrar por estatus"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              style={{ width: '100%' }}
              disabled={loading}
            >
              <Option value="Pendiente">Pendiente</Option>
              <Option value="Rechazado">Rechazado</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Buscar por nombre"
              allowClear
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
            />
          </Col>
        </Row>
      </Card>

      {/* Tabla principal */}
      <Table
        columns={columns}
        dataSource={filteredDocuments}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} documentos`
        }}
        scroll={{ x: 1000 }}
        className="documents-table"
      />

      {/* Modal: Subir documento */}
      <Modal
        title="Subir Nuevo Documento"
        open={modals.upload}
        onCancel={() => closeModal('upload')}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUploadNewDocument}
        >
          <Form.Item
            name="name"
            label="Nombre del documento"
            rules={[{ required: true, message: 'Ingrese el nombre del documento' }]}
          >
            <Input disabled={loading} />
          </Form.Item>

          <Form.Item
            name="file"
            label="Archivo PDF"
            rules={[{ required: true, message: 'Seleccione un archivo PDF' }]}
          >
            <Upload.Dragger
              accept=".pdf"
              maxCount={1}
              beforeUpload={() => false}
              disabled={loading}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                Haga clic o arrastre el archivo PDF aquí
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            name="signers"
            label="Firmantes"
            rules={[{ required: true, message: 'Seleccione al menos un firmante' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar firmantes"
              options={projectUsers.map(user => ({
                label: user.nombre_completo || user.name,
                value: user.id
              }))}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item name="comment" label="Comentario (opcional)">
            <TextArea rows={3} disabled={loading} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Subir Documento
              </Button>
              <Button onClick={() => closeModal('upload')} disabled={loading}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Visor PDF y firma */}
      <Modal
        title={`Ver Documento: ${currentDocument?.nombre_documento || currentDocument?.name}`}
        open={modals.pdfViewer}
        onCancel={() => closeModal('pdfViewer')}
        width="95vw"
        style={{ top: 20, maxWidth: '1200px' }}
        footer={showSignature ? [
          <Button key="clear" onClick={() => signatureRef?.clear()} disabled={loading}>
            Limpiar Firma
          </Button>,
          <Button key="cancel" onClick={() => closeModal('pdfViewer')} disabled={loading}>
            Cancelar
          </Button>,
          <Button key="sign" type="primary" onClick={handleSignDocument} loading={loading}>
            Firmar Documento
          </Button>
        ] : null}
        destroyOnClose
        bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="pdf-viewer-container" style={{ textAlign: 'center', width: '100%' }}>
          {pdfLoadError ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#ff4d4f' }}>
              <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Error al cargar el documento: {pdfLoadError}</div>
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                Verifique que el archivo existe y es un PDF válido
              </div>
            </div>
          ) : pdfFile ? (
            <div
              ref={pdfWrapperRef}
              style={{
                margin: '0 auto',
                position: 'relative',
                display: 'inline-block',
              }}
              onClick={handlePdfClick}
            >
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading="Cargando documento..."
                error="Error al cargar el documento"
                options={{
                  httpHeaders: { 'Access-Control-Allow-Origin': '*' },
                  withCredentials: false,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(window.innerWidth * 0.8, 1000)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading="Cargando página..."
                  error="Error al cargar la página"
                  onRenderSuccess={handlePDFPageRenderSuccess}
                />
                {/* Firma visual */}
                {showSignature && pdfPageRendered && (
                  <div
                    style={{
                      position: 'absolute',
                      left: signaturePosition.x - 50,
                      top: signaturePosition.y - 25,
                      pointerEvents: 'none',
                      zIndex: 10,
                      width: 100,
                      height: 50,
                      border: '2px dashed #1890ff',
                      background: 'rgba(24,144,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1890ff',
                      fontWeight: 'bold'
                    }}
                  >
                    Firma aquí
                  </div>
                )}
              </Document>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              Cargando documento...
            </div>
          )}

          {numPages && (
            <div className="pdf-controls" style={{ margin: '20px 0' }}>
              <Button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(pageNumber - 1)}
              >
                Anterior
              </Button>
              <span style={{ margin: '0 16px' }}>Página {pageNumber} de {numPages}</span>
              <Button
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber(pageNumber + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}

          {showSignature && (
            <div className="signature-container" style={{ marginTop: 20 }}>
              <Divider>Firmar Documento</Divider>
              <div style={{ textAlign: 'center' }}>
                <p>
                  <b>1.</b> Haz <span style={{ color: '#1890ff' }}>click</span> en el PDF donde deseas incrustar la firma.<br />
                  <b>2.</b> Dibuja tu firma en el recuadro.<br />
                  <b>3.</b> Presiona <b>Firmar Documento</b>.
                </p>
                <div className="signature-canvas-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                  <SignatureCanvas
                    ref={(ref) => setSignatureRef(ref)}
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: 'signature-canvas'
                    }}
                  />
                </div>
                <div style={{ margin: '10px 0', fontSize: 14 }}>
                  <b>Posición seleccionada:</b> X: {Math.round(signaturePosition.x)}, Y: {Math.round(signaturePosition.y)}
                </div>
                <span style={{ color: '#999', fontSize: 12 }}>
                  (Si no seleccionas, la firma se colocará en la posición por defecto)
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Lista Maestra */}
      <Modal
        title="Lista Maestra - Documentos Firmados"
        open={modals.masterList}
        onCancel={() => closeModal('masterList')}
        width={1000}
        footer={null}
        destroyOnClose
      >
        <Table
          columns={[
            { title: 'Nombre', dataIndex: 'nombre_documento', key: 'nombre_documento' },
            { title: 'Versión', dataIndex: 'numero_version', key: 'numero_version', render: v => <Tag>v{v}</Tag> },
            { title: 'Firmado por', dataIndex: 'subido_por', key: 'subido_por' },
            { title: 'Fecha', dataIndex: 'fecha_inclusion', key: 'fecha_inclusion', render: d => new Date(d).toLocaleDateString() },
            {
              title: 'Descargar',
              key: 'download',
              render: (_, record) => {
                // Usa ruta absoluta si existe, si no concatena con backendBaseUrl
                const downloadUrl = record.ruta_archivo.startsWith('http')
                  ? record.ruta_archivo
                  : `${backendBaseUrl}${record.ruta_archivo}`;
                return (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(downloadUrl, "_blank")}
                  >
                    Descargar
                  </Button>
                );
              }
            }
          ]}
          dataSource={signedDocuments}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* Modal: Rechazar documento */}
      <Modal
        title="Rechazar Documento"
        open={modals.reject}
        onCancel={() => closeModal('reject')}
        footer={null}
        destroyOnClose
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectDocument}
        >
          <Form.Item
            name="reason"
            label="Motivo del rechazo"
            rules={[{ required: true, message: 'Ingrese el motivo del rechazo' }]}
          >
            <TextArea rows={4} placeholder="Explique por qué rechaza este documento..." disabled={loading} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Rechazar Documento
              </Button>
              <Button onClick={() => closeModal('reject')} disabled={loading}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Historial de versiones */}
      <Modal
        title={`Historial de versiones: ${selectedVersionDoc?.nombre_documento || ''}`}
        open={modals.versions}
        onCancel={() => closeModal('versions')}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Table
          columns={[
            { title: 'Versión', dataIndex: 'numero_version', key: 'numero_version', render: v => <Tag>v{v}</Tag> },
            { title: 'Subido por', dataIndex: 'subido_por', key: 'subido_por' },
            { title: 'Fecha', dataIndex: 'fecha_subida', key: 'fecha_subida', render: d => new Date(d).toLocaleDateString() },
            { title: 'Estatus', dataIndex: 'estatus', key: 'estatus', render: s => <Tag>{s}</Tag> },
            { title: 'Firmantes', dataIndex: 'total_firmantes', key: 'total_firmantes', render: (t, r) => `${r.firmados || 0}/${t}` }
          ]}
          dataSource={versionHistory}
          rowKey="id"
          pagination={false}
        />
      </Modal>

      <Modal
        title="Subir Nueva Versión"
        open={modals.uploadVersion}
        onCancel={closeUploadVersionModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={uploadVersionForm}
          layout="vertical"
          onFinish={handleUploadNewVersion}
        >
          <Form.Item
            name="file"
            label="Archivo PDF"
            rules={[{ required: true, message: 'Seleccione un archivo PDF' }]}
          >
            <Upload.Dragger
              accept=".pdf"
              maxCount={1}
              beforeUpload={() => false}
              disabled={loading}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                Haga clic o arrastre el archivo PDF aquí
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item
            name="signers"
            label="Firmantes"
            rules={[{ required: true, message: 'Seleccione al menos un firmante' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar firmantes"
              options={projectUsers.map(user => ({
                label: user.nombre_completo || user.name,
                value: user.id
              }))}
              disabled={loading}
            />
          </Form.Item>
          <Form.Item name="comment" label="Comentario (opcional)">
            <TextArea rows={3} disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Subir Versión
              </Button>
              <Button onClick={closeUploadVersionModal} disabled={loading}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentsContent;