// File: frontend/src/components/ModalEmailVerification.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Steps } from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import authService from '../../../services/authService';
import Messages from '../../Messages/Messages';
import './ModalEmailVerification.css';

const { Step } = Steps;

const ModalEmailVerification = ({
  visible = true,
  email = '',
  formData = null,
  onComplete = () => { },
  onClose = () => { },
  colorTheme = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280'
  }
}) => {
  const [code, setCode] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = ingresar código, 1 = éxito

  useEffect(() => {
    setCodeValid(code.length === 6 && /^\d{6}$/.test(code));
  }, [code]);

  const handleVerifyCode = async () => {
    if (!codeValid) {
      Messages.error('Código incorrecto', 'Por favor ingresa un código de 6 dígitos válido');
      return;
    }

    setLoading(true);
    try {
      // Registrar usuario con código verificado
      const result = await authService.register({
        nombre: formData.firstName?.trim(),
        apellido: formData.lastName?.trim(),
        email: formData.email?.trim(),
        password: formData.password,
        telefono: formData.phone?.trim(),
        id_rol: parseInt(formData.role, 10),
        codigo: code
      });


      if (result.success) {
        setCurrentStep(1);
        Messages.success('¡Registro exitoso!', 'Tu cuenta ha sido creada correctamente');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        Messages.error('Error', result.message || 'Código incorrecto');
      }
    } catch (error) {
      Messages.error('Error verificando el código', error.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setCodeValid(false);
    setCurrentStep(0);
    onClose();
  };

  const cssVars = {
    '--primary-color': colorTheme.primary,
    '--secondary-color': colorTheme.secondary,
    '--success-color': colorTheme.success,
    '--error-color': colorTheme.error,
    '--warning-color': colorTheme.warning,
    '--background-color': colorTheme.background,
    '--text-color': colorTheme.text,
    '--text-secondary-color': colorTheme.textSecondary
  };

  return (
    <Modal
      title="Verificar correo electrónico"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
      className="email-verification-modal"
      maskClosable={false}
      style={cssVars}
    >
      <div className="steps-container">
        <Steps current={currentStep} size="small">
          <Step title="Código de Verificación" icon={<SafetyOutlined />} />
        </Steps>
      </div>

      {currentStep === 0 && (
        <div className="step-content">
          <div className="step-header">
            <div className="step-icon" style={{ background: '#344A46' }}>
              <MailOutlined />
            </div>
            <h3>Ingresa tu código</h3>
            <p>
              Escribe el código de 6 dígitos que enviamos a&nbsp;
              <strong>{email}</strong>
            </p>
          </div>

          <div className="step-form">
            <div className="form-item">
              <label className="form-label">Código de verificación</label>
              <Input
                size="large"
                placeholder="123456"
                value={code}
                onChange={e =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                maxLength={6}
                suffix={
                  code ? (
                    codeValid ? (
                      <CheckCircleOutlined style={{ color: colorTheme.success }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: colorTheme.error }} />
                    )
                  ) : null
                }
                status={
                  code && !codeValid ? 'error' : codeValid ? 'success' : ''
                }
              />
              {code && !codeValid && (
                <div className="form-error">El código debe tener 6 dígitos</div>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              disabled={!codeValid}
              onClick={handleVerifyCode}
              className="step-button"
            >
              Verificar Código
            </Button>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="success-content">
          <div className="success-icon">
            <CheckCircleOutlined />
          </div>
          <h3>¡Correo verificado!</h3>
          <p>Ahora puedes continuar con tu registro.</p>
          <Button
            type="primary"
            size="large"
            block
            onClick={handleClose}
            className="step-button"
          >
            Continuar
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ModalEmailVerification;