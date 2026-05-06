//File: frontend/src/pages/Auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, Progress } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import loginImage from '../../assets/proy.jpeg';
import ModalEmailVerification from '../../components/Modals/CreateAccount/ModalEmailVerification';
import Messages from '../../components/Messages/Messages';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import './Auth.css';
import '../../components/Messages/Messages.css';

const { Option } = Select;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [formData, setFormData] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');

  // Calcula fortaleza de contraseña (0-4)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { score: Math.round((score / 5) * 100), label: 'Débil', color: '#ff4d4f' };
    if (score === 3) return { score: Math.round((score / 5) * 100), label: 'Regular', color: '#faad14' };
    return { score: Math.round((score / 5) * 100), label: 'Fuerte', color: '#52c41a' };
  };
  const pwdStrength = getPasswordStrength(passwordValue);

  const onFinish = async (values) => {
    setLoading(true);

    // Validar formato de email
    if (!Messages.validateEmail(values.email.trim())) {
      Messages.registerInvalidEmail();
      setLoading(false);
      return;
    }

    // Validar contraseña
    if (!Messages.validatePassword(values.password)) {
      Messages.registerInvalidPassword();
      setLoading(false);
      return;
    }

    Messages.loading('Enviando código...', 'Enviando código de verificación...');

    try {
      // Enviar código de verificación
      const result = await authService.sendVerificationCode({
        email: values.email.trim(),
        nombre: values.firstName.trim()
      });

      Messages.close();

      if (result.success) {
        setShowEmailVerificationModal(true);
        setUserEmail(values.email);
        // Guardar datos del formulario para usar después
        setFormData(values);
        Messages.success('Código enviado', 'Revisa tu correo electrónico');
      } else {
        Messages.error('Error', result.message || 'Error al enviar código');
      }

    } catch (error) {
      Messages.close();
      Messages.connectionError();
    } finally {
      setLoading(false);
    }
  };

  // Validación personalizada en tiempo real (basada en las utilidades de Messages)
  const validateForm = () => {
    const values = form.getFieldsValue();
    // ¡Actualizado para incluir 'phone'!
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'role'];

    // Validar campos requeridos y que no sean solo espacios
    if (!Messages.validateRequiredFields(values, requiredFields) ||
      values.firstName.trim() === '' ||
      values.lastName.trim() === '' ||
      values.email.trim() === '' ||
      (values.phone && values.phone.trim() === '') ||
      values.password.trim() === '') {
      return false;
    }

    // Validar formato de email y fortaleza de contraseña
    return Messages.validateEmail(values.email.trim()) && Messages.validatePassword(values.password);
  };

  // Handler para validar antes de enviar el formulario
  const handleFormSubmit = () => {
    if (!validateForm()) {
      Messages.registerEmptyFields();
      return;
    }
    form.submit();
  };

  // Validación de contraseña en tiempo real para quitar espacios
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    if (password.includes(' ')) {
      const cleanPassword = password.replace(/\s/g, '');
      form.setFieldsValue({ password: cleanPassword });
      setPasswordValue(cleanPassword);
    } else {
      setPasswordValue(password);
    }
  };

  // Limpiar espacios en blanco del email al escribir
  const handleEmailChange = (e) => {
    const email = e.target.value.trim();
    form.setFieldsValue({ email: email });
  };

  // Limpiar espacios en blanco del teléfono y asegurar solo números
  const handlePhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
    form.setFieldsValue({ phone: phone });
  };

  // Handler cuando se completa la verificación de email
  const handleEmailVerificationComplete = async () => {
    setShowEmailVerificationModal(false);
    Messages.registerEmailVerificationSuccess();
    setTimeout(() => {
      navigate('/'); // Navegar al login una vez que la verificación se completa
    }, 2000);
  };

  return (
    <div className="login-container">
      {/* --- Mitad izquierda: imagen --- */}
      <div
        className="login-image-section"
        style={{
          backgroundImage: `url(${loginImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="image-overlay">
          <div className="image-content">
            <h2>¡Únete a nosotros!</h2>
            <p>Crea tu cuenta y comienza a gestionar tus proyectos</p>
          </div>
        </div>
      </div>

      {/* --- Mitad derecha: formulario --- */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="logo-container">
            <div className="logo">
              <img src={logo} alt="Logo" className="logo-image" />
            </div>
          </div>

          <h1 className="login-title">Crear una nueva cuenta</h1>

          <Card className="login-card">
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              onFinishFailed={handleFormSubmit}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Nombre"
                name="firstName"
                rules={[
                  { required: true, message: 'Por favor ingresa tu nombre' },
                  {
                    validator: (_, value) => {
                      if (value && value.trim() === '') {
                        return Promise.reject(new Error('El nombre no puede estar vacío'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="Ingresa tu nombre"
                  className="login-input"
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    form.setFieldsValue({ firstName: value });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Apellidos"
                name="lastName"
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingresa tus apellidos',
                  },
                  {
                    validator: (_, value) => {
                      if (value && value.trim() === '') {
                        return Promise.reject(new Error('Los apellidos no pueden estar vacíos'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="Ingresa tus apellidos"
                  className="login-input"
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    form.setFieldsValue({ lastName: value });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Correo electrónico"
                name="email"
                rules={[
                  { type: 'email', message: 'Correo electrónico inválido' },
                  {
                    required: true,
                    message: 'Por favor ingresa tu correo electrónico',
                  },
                  {
                    validator: (_, value) => {
                      if (value && value.trim() === '') {
                        return Promise.reject(new Error('El correo no puede estar vacío'));
                      }
                      if (value && !Messages.validateEmail(value.trim())) {
                        return Promise.reject(new Error('El formato del correo es inválido'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="input-icon" />}
                  placeholder="Ingresa tu correo electrónico"
                  className="login-input"
                  onChange={handleEmailChange}
                />
              </Form.Item>

              <Form.Item
                label="Teléfono"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingresa tu teléfono',
                  },
                  {
                    validator: (_, value) => {
                      if (value && value.trim() !== '' && !/^\d{10}$/.test(value.trim())) {
                        return Promise.reject(new Error('Por favor ingresa un número de teléfono válido de 10 dígitos.'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="input-icon" />}
                  placeholder="Ingresa tu teléfono (ej. 5512345678)"
                  className="login-input"
                  maxLength={10}
                  onChange={handlePhoneChange}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    form.setFieldsValue({ phone: value });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Selecciona tu rol"
                name="role"
                rules={[
                  { required: true, message: 'Por favor selecciona tu rol' },
                ]}
              >
                <Select
                  placeholder="Selecciona tu rol"
                  className="login-select"
                  suffixIcon={<TeamOutlined />}
                >
                  <Option value={2}>Administrador</Option>
                  <Option value={3}>Colaborador</Option>
                  <Option value={4}>Cliente</Option>
                </Select>

              </Form.Item>

              <Form.Item
                label="Contraseña"
                name="password"
                rules={[
                  { required: true, message: 'Por favor ingresa tu contraseña' },
                  {
                    validator: (_, value) => {
                      if (value && value.includes(' ')) {
                        return Promise.reject(new Error('La contraseña no puede contener espacios'));
                      }
                      if (value && !Messages.validatePassword(value)) {
                        return Promise.reject(new Error('La contraseña debe tener 8 caracteres, una mayúscula, una minúscula y un carácter especial'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                extra={
                  passwordValue ? (
                    <div style={{ marginTop: 6 }}>
                      <Progress
                        percent={pwdStrength.score}
                        showInfo={false}
                        strokeColor={pwdStrength.color}
                        size="small"
                        style={{ marginBottom: 2 }}
                      />
                      <span style={{ color: pwdStrength.color, fontSize: 12, fontWeight: 600 }}>
                        {pwdStrength.label}
                      </span>
                      <span style={{ color: '#999', fontSize: 11, marginLeft: 8 }}>
                        Mínimo 8 caracteres, mayúscula, minúscula y carácter especial
                      </span>
                    </div>
                  ) : 'Mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial'
                }
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Crea una contraseña"
                  className="login-input"
                  onChange={handlePasswordChange}
                  onPressEnter={handleFormSubmit}
                />
              </Form.Item>

              <div className="login-links">
                <a
                  href="#"
                  className="no-account"
                  onClick={() => navigate('/')}
                >
                  ¿Ya tienes cuenta?
                </a>
              </div>

              <div className="login-button-container">
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                    loading={loading}

                  >
                    {loading ? 'Registrando...' : 'Registrar'}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
      </div>

      {/* Modal de verificación de email */}
      {showEmailVerificationModal && (
        <ModalEmailVerification
          visible={showEmailVerificationModal}
          email={userEmail}
          formData={formData}
          onComplete={handleEmailVerificationComplete}
          onClose={() => setShowEmailVerificationModal(false)}
        />
      )}
    </div>
  );
};

export default RegisterPage;