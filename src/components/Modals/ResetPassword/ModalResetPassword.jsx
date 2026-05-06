// File: frontend/src/components/Modals/ResetPassword/ModalResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Steps } from 'antd';
import {
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SafetyOutlined
} from '@ant-design/icons';
import Messages from '../../Messages/Messages';
import authService from '../../../services/authService';
import './ModalResetPassword.css';

const { Step } = Steps;
const { Password } = Input;

const ModalResetPassword = ({
  visible = true,
  onClose = () => { },
  onComplete = () => { },
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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados de validación
  const [emailValid, setEmailValid] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // Estados de los campos del formulario
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validaciones del lado del cliente
  const validateEmail = (emailValue) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  const validatePassword = (passwordValue) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/.test(passwordValue);

  useEffect(() => {
    setEmailValid(validateEmail(email));
  }, [email]);

  useEffect(() => {
    setCodeValid(code.length === 6 && /^\d{6}$/.test(code));
  }, [code]);

  useEffect(() => {
    setPasswordValid(validatePassword(newPassword));
    setPasswordsMatch(
      newPassword && confirmPassword && newPassword === confirmPassword
    );
  }, [newPassword, confirmPassword]);

  // Handlers para cada paso del flujo
  const handleEmailSubmit = async () => {
    if (!emailValid) {
      Messages.error('Correo inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setCurrentStep(1);
        Messages.success('Código de verificación enviado', 'Se ha enviado un código de verificación a tu correo.');
      } else {
        Messages.error('Error', result.message || 'Error enviando el código de recuperación.');
      }
    } catch (error) {
      Messages.error('Error de conexión', error.message || 'Ocurrió un error al intentar enviar el código. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!codeValid) {
      Messages.error('Código inválido', 'Por favor ingresa un código de 6 dígitos válido.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyResetCode(email, code);

      if (result.success) {
        setCurrentStep(2);
        Messages.success('Código verificado', 'El código ha sido verificado correctamente.');
      } else {
        Messages.error('Error', 'Código incorrecto, vuelve a ingresar el código de verificación.');
      }
    } catch (error) {
      Messages.error('Error de verificación', error.message || 'Código incorrecto, vuelve a ingresar el código de verificación.');
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordReset = async () => {
    if (!passwordValid) {
      Messages.warning('Contraseña no válida', 'La nueva contraseña no cumple con los requisitos.');
      return;
    }
    if (!passwordsMatch) {
      Messages.warning('Contraseñas no coinciden', 'Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(email, code, newPassword);

      if (result.success) {
        Messages.success('Contraseña restablecida', 'Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión.');
        onComplete();
        handleReset();
      } else {
        Messages.error('Error al cambiar contraseña', result.message || 'Ocurrió un error al restablecer la contraseña.');
      }
    } catch (error) {
      Messages.error('Error de conexión', error.message || 'Ocurrió un error al intentar cambiar la contraseña. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };


  // Reinicia todos los estados del formulario
  const handleReset = () => {
    setCurrentStep(0);
    setEmail('');
    setCode('');
    setNewPassword('');
    setCodeValid(false);
    setConfirmPassword('');
    setEmailValid(false);
    setPasswordsMatch(false);
    setPasswordValid(false);
  };

  // Cierra el modal y reinicia su estado
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Renderiza el contenido del modal según el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <div className="step-header">
              <div className="step-icon" style={{ background: '#344A46' }}><MailOutlined /></div>
              <h3>Verificación de Correo</h3>
              <p>Ingresa tu correo electrónico para recibir el código de verificación</p>
            </div>

            <div className="step-form">
              <div className="form-item">
                <label className="form-label">Correo Electrónico</label>
                <Input
                  size="large"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  prefix={<MailOutlined />}
                  suffix={email ? (
                    emailValid
                      ? <CheckCircleOutlined style={{ color: colorTheme.success }} />
                      : <CloseCircleOutlined style={{ color: colorTheme.error }} />
                  ) : null}
                  status={email && !emailValid ? 'error' : emailValid ? 'success' : ''}
                />
                {email && !emailValid && (
                  <div className="form-error">Por favor ingresa un correo válido</div>
                )}
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                disabled={!emailValid}
                onClick={handleEmailSubmit}
                className="step-button"
              >
                Enviar Código
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <div className="step-icon" style={{ background: '#344A46' }}><SafetyOutlined /></div>
              <h3>Código de Verificación</h3>
              <p>Ingresa el código de 6 dígitos enviado a <strong>{email}</strong></p>
            </div>

            <div className="step-form">
              <div className="form-item">
                <label className="form-label">Código de Verificación</label>
                <Input
                  size="large"
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  suffix={code ? (
                    codeValid
                      ? <CheckCircleOutlined style={{ color: colorTheme.success }} />
                      : <CloseCircleOutlined style={{ color: colorTheme.error }} />
                  ) : null}
                  status={code && !codeValid ? 'error' : codeValid ? 'success' : ''}
                />
                {code && !codeValid && (
                  <div className="form-error">El código debe tener 6 dígitos</div>
                )}
              </div>

              <div className="step-actions">
                <Button
                  size="large"
                  onClick={() => setCurrentStep(0)}
                  className="back-button"
                >
                  Volver
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  disabled={!codeValid}
                  onClick={handleCodeSubmit}
                  className="step-button"
                >
                  Verificar Código
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <div className="step-icon" style={{ background: '#344A46' }}><LockOutlined /></div>
              <h3>Nueva Contraseña</h3>
              <p>Crea una nueva contraseña segura para tu cuenta</p>
            </div>

            <div className="step-form">
              <div className="form-item">
                <label className="form-label">Nueva Contraseña</label>
                <Password
                  size="large"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                  status={newPassword && !passwordValid ? 'error' : passwordValid ? 'success' : ''}
                />
                {newPassword && !passwordValid && (
                  <div className="form-error">
                    La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y NO debe contener espacios.
                  </div>
                )}
              </div>

              <div className="form-item">
                <label className="form-label">Confirmar Contraseña</label>
                <Password
                  size="large"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                  suffix={confirmPassword ? (
                    passwordsMatch
                      ? <CheckCircleOutlined style={{ color: colorTheme.success }} />
                      : <CloseCircleOutlined style={{ color: colorTheme.error }} />
                  ) : null}
                  status={confirmPassword && !passwordsMatch ? 'error' : passwordsMatch ? 'success' : ''}
                />
                {confirmPassword && !passwordsMatch && (
                  <div className="form-error">Las contraseñas no coinciden</div>
                )}
              </div>

              <div className="step-actions">
                <Button
                  size="large"
                  onClick={() => setCurrentStep(1)}
                  className="back-button"
                >
                  Volver
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  disabled={!passwordValid || !passwordsMatch}
                  onClick={handlePasswordReset}
                  className="step-button"
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Variables CSS para estilos en línea
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
      title="Recuperar Contraseña"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
      className="password-reset-modal"
      maskClosable={false}
      style={cssVars}
    >
      <div className="steps-container">
        <Steps current={currentStep} size="small">
          <Step title="Verificar Email" icon={<MailOutlined />} />
          <Step title="Código de Verificación" icon={<SafetyOutlined />} />
          <Step title="Nueva Contraseña" icon={<LockOutlined />} />
        </Steps>
      </div>

      {renderStep()}
    </Modal>
  );
};

export default ModalResetPassword;