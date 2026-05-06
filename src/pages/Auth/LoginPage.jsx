// File: frontend/src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../contexts/useAuth';
import Messages from '../../components/Messages/Messages';
import ModalResetPassword from '../../components/Modals/ResetPassword/ModalResetPassword';
import loginImage from '../../assets/proy.jpeg';
import logo from '../../assets/logo.png';
import './Auth.css';
import '../../components/Messages/Messages.css';

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, getCorrectRouteForRole } = useAuth();

  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);

    // Validar campos requeridos
    if (!values.username || values.username.trim() === '' || !values.password || values.password.trim() === '') {
      Messages.loginEmptyFields();
      setLoading(false);
      return;
    }

    Messages.loading('Iniciando sesión...', 'Verificando credenciales...');

    try {
      // Llamada real al servicio de login
      const credentials = {
        email: values.username.trim(),
        password: values.password
      };

      const response = await login(credentials);

      Messages.close();

      if (response.success) {
        // Mostrar en consola token y user guardados en localStorage
        console.log('Token en localStorage:', localStorage.getItem('token'));
        console.log('User en localStorage:', JSON.parse(localStorage.getItem('user')));

        const userRole = response.data.user.nombre_rol;
        Messages.loginSuccess(response.data.user.nombre);

        // Obtener ruta según el rol y redirigir
        const redirectPath = getCorrectRouteForRole(userRole);

        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
      }
    } catch (error) {
      Messages.close();

      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('credenciales') || errorMessage.includes('inválidas')) {
        Messages.loginInvalidCredentials();
      } else if (errorMessage.includes('no verificada') || errorMessage.includes('verifica')) {
        Messages.loginAccountDisabled();
      } else if (errorMessage.includes('conexión') || errorMessage.includes('network')) {
        Messages.connectionError();
      } else {
        Messages.error('Error de autenticación', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Validación personalizada en tiempo real
  const validateForm = () => {
    const values = form.getFieldsValue();
    return (values.username && values.username.trim() !== '' && values.password && values.password.trim() !== '');
  };

  // Handler para validar antes de enviar
  const handleFormSubmit = () => {
    if (!validateForm()) {
      Messages.loginEmptyFields();
      return;
    }
    form.submit();
  };

  // Handler para mostrar modal de reset de contraseña
  const handleShowPasswordReset = () => {
    setShowPasswordResetModal(true);
  };

  // Handler para completar reset de contraseña
  const handlePasswordResetComplete = () => {
    setShowPasswordResetModal(false);
    Messages.passwordResetSuccess();
  };

  return (
    <div className="login-container">
      {/* Mitad izquierda - Imagen */}
      <div
        className="login-image-section"
        style={{ backgroundImage: `url(${loginImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="image-overlay">
          <div className="image-content">
            <h2>Bienvenido</h2>
            <p>Gestiona tus proyectos de manera eficiente</p>
          </div>
        </div>
      </div>

      {/* Mitad derecha - Formulario */}
      <div className="login-form-section">
        <div className="form-container">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo">
              <img src={logo} alt="Logo" className="logo-image" />
            </div>
          </div>

          {/* Título */}
          <h1 className="login-title">Sistema de Administración de Proyectos</h1>

          {/* Card con formulario */}
          <Card className="login-card">
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Usuario"
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingresa tu usuario',
                  },
                  {
                    validator: (_, value) => {
                      if (value && value.trim() === '') {
                        return Promise.reject(new Error('El usuario no puede estar vacío'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="Ingresa tu email"
                  className="login-input"
                  onBlur={(e) => {
                    // Limpiar espacios en blanco al perder el foco
                    const value = e.target.value.trim();
                    form.setFieldsValue({ username: value });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Contraseña"
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingresa tu contraseña',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Ingresa tu contraseña"
                  className="login-input"
                  onPressEnter={handleFormSubmit}
                />
              </Form.Item>

              {/* Enlaces */}
              <div className="login-links">
                <a
                  className="forgot-password"
                  style={{ cursor: 'pointer' }}
                  onClick={handleShowPasswordReset}
                >
                  ¿Olvidaste tu contraseña?
                </a>
                <a href="#" className="no-account" onClick={() => navigate('/register')}>
                  ¿No tienes cuenta?
                </a>
              </div>

              {/* Botón de login */}
              <div className="login-button-container">
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                    loading={loading}
                    onClick={handleFormSubmit}
                  >
                    {loading ? 'Iniciando sesión...' : 'Login'}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
      </div>

      {/* Modal de reset de contraseña */}
      {showPasswordResetModal && (
        <ModalResetPassword
          visible={showPasswordResetModal}
          onComplete={handlePasswordResetComplete}
          onClose={() => setShowPasswordResetModal(false)}
        />
      )}
    </div>
  );
};

export default LoginPage;