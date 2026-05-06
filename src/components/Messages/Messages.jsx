// File: frontend/src/components/Messages/Messages.jsx
import Swal from 'sweetalert2';

class Messages {
  // Configuración base para todos los mensajes
  static baseConfig = {
    confirmButtonColor: '#1890ff',
    cancelButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      content: 'custom-swal-content',
      confirmButton: 'custom-swal-confirm-btn',
      cancelButton: 'custom-swal-cancel-btn'
    }
  };

  static custom(messageObject) {
  return Swal.fire({
    ...this.baseConfig,
    ...messageObject
  });
}


  // ==================== MÉTODOS GENERALES ====================

  /**
   * Muestra un mensaje de éxito
   */
  static success(title = '¡Éxito!', text = '', callback = null) {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'success',
      title,
      text,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    }).then(() => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  /**
   * Muestra un mensaje de error
   */
  static error(title = '¡Error!', text = '', callback = null) {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido'
    }).then(() => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  /**
   * Muestra un mensaje de advertencia
   */
  static warning(title = '¡Advertencia!', text = '', callback = null) {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Entendido'
    }).then(() => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  /**
   * Muestra un mensaje de información
   */
  static info(title = 'Información', text = '', callback = null) {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Entendido'
    }).then(() => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  /**
   * Muestra un mensaje de confirmación
   */
  static confirm(title = '¿Estás seguro?', text = '', onConfirm = null, onCancel = null) {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && onConfirm && typeof onConfirm === 'function') {
        onConfirm();
      } else if (result.isDismissed && onCancel && typeof onCancel === 'function') {
        onCancel();
      }
    });
  }

  // ==================== MÉTODOS ESPECÍFICOS PARA LOGIN ====================

  /**
   * Error: Campos vacíos en login
   */
  static loginEmptyFields() {
    return this.error(
      'Campos requeridos',
      'Debes llenar todos los campos.',
      () => {
        // Enfocar el primer campo vacío
        const firstInput = document.querySelector('input[name="username"]');
        if (firstInput) firstInput.focus();
      }
    );
  }

  /**
   * Error: Credenciales incorrectas
   */
  static loginInvalidCredentials() {
    return this.error(
      'Credenciales incorrectas',
      'Correo o contraseña incorrectos.',
      () => {
        // Limpiar el campo de contraseña
        const passwordInput = document.querySelector('input[name="password"]');
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.focus();
        }
      }
    );
  }

  /**
   * Éxito: Login exitoso
   */
  static loginSuccess(userName = '') {
    return this.success(
      '¡Bienvenido!',
      userName ? `Hola ${userName}, has iniciado sesión correctamente.` : 'Has iniciado sesión correctamente.'
    );
  }

  /**
   * Error: Cuenta desactivada
   */
  static loginAccountDisabled() {
    return this.error(
      'Cuenta desactivada',
      'Tu cuenta ha sido desactivada. Contacta al administrador para más información.'
    );
  }

  // ==================== MÉTODOS ESPECÍFICOS PARA REGISTRO ====================

  /**
   * Error: Campos vacíos en registro
   */
  static registerEmptyFields() {
    return this.error(
      'Campos requeridos',
      'Debes llenar todos los campos.',
      () => {
        // Enfocar el primer campo vacío
        const firstInput = document.querySelector('input[name="firstName"]');
        if (firstInput) firstInput.focus();
      }
    );
  }

  /**
   * Error: Contraseña no válida
   */
  static registerInvalidPassword() {
    return this.warning(
      'Contraseña no válida',
      'La contraseña debe tener 8 caracteres, una mayúscula, una minúscula y al menos un carácter especial y no contener espacios.',
      () => {
        // Enfocar el campo de contraseña
        const passwordInput = document.querySelector('input[name="password"]');
        if (passwordInput) {
          passwordInput.focus();
          passwordInput.select();
        }
      }
    );
  }

  /**
   * Error: Email ya registrado
   */
  static registerEmailExists() {
    return this.error(
      'Email ya registrado',
      'El correo ya está registrado. Intenta con otro correo o inicia sesión.',
      () => {
        // Enfocar el campo de email
        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
          emailInput.focus();
          emailInput.select();
        }
      }
    );
  }

  /**
   * Error: Email no válido
   */
  static registerInvalidEmail() {
    return this.error(
      'Correo no válido',
      'Solo se permiten correos institucionales con dominio @uteq.edu.mx.',
      () => {
        // Enfocar el campo de email
        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
          emailInput.focus();
          emailInput.select();
        }
      }
    );
  }

  /**
   * Éxito: Registro exitoso
   */
  static registerSuccess() {
    return this.success(
      '¡Registro exitoso!',
      'Tu cuenta ha sido creada correctamente. Verifica tu correo para activar la cuenta.'
    );
  }

  /**
   * Info: Verificación de email requerida
   */
  static registerEmailVerificationRequired() {
    return this.info(
      'Verificación requerida',
      'Se ha enviado un código de verificación a tu correo electrónico. Revisa tu bandeja de entrada.'
    );
  }

  /**
   * Éxito: Verificación de email completada
   */
  static registerEmailVerificationSuccess() {
    return this.success(
      '¡Cuenta activada!',
      'Tu cuenta ha sido activada exitosamente. Ahora puedes iniciar sesión.'
    );
  }

  // ==================== MÉTODOS ESPECÍFICOS PARA RECUPERACIÓN DE CONTRASEÑA ====================

  /**
   * Éxito: Código de recuperación enviado
   */
  static passwordResetCodeSent() {
    return this.success(
      'Código enviado',
      'Se ha enviado un código de recuperación a tu correo electrónico.'
    );
  }

  /**
   * Error: Código de recuperación inválido
   */
  static passwordResetInvalidCode() {
    return this.error(
      'Código inválido',
      'El código ingresado es incorrecto o ha expirado. Solicita uno nuevo.'
    );
  }

  /**
   * Éxito: Contraseña restablecida
   */
  static passwordResetSuccess() {
    return this.success(
      '¡Contraseña restablecida!',
      'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.'
    );
  }

  // ==================== MÉTODOS PARA ERRORES DE CONEXIÓN ====================

  /**
   * Error: Problemas de conexión
   */
  static connectionError() {
    return this.error(
      'Error de conexión',
      'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.'
    );
  }

  /**
   * Error: Error interno del servidor
   */
  static serverError() {
    return this.error(
      'Error del servidor',
      'Ocurrió un error interno del servidor. Intenta nuevamente más tarde.'
    );
  }

  // ==================== MÉTODOS DE CARGA ====================

  /**
   * Muestra un mensaje de carga
   */
  static loading(title = 'Cargando...', text = 'Por favor espera un momento') {
    return Swal.fire({
      ...this.baseConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Cierra cualquier mensaje de SweetAlert2 que esté abierto
   */
  static close() {
    return Swal.close();
  }

  // ==================== UTILIDADES ====================

  /**
   * Valida si una contraseña cumple con los requisitos
   */
  static validatePassword(password) {
    // Mínimo 8 caracteres, una mayúscula, una minúscula, un carácter especial, sin espacios
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?!.*\s).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Valida si un email es válido (solo correos institucionales @uteq.edu.mx)
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@uteq\.edu\.mx$/i;
    return emailRegex.test(email);
  }

  /**
   * Verifica si todos los campos requeridos están llenos
   */
  static validateRequiredFields(values, requiredFields) {
    return requiredFields.every(field => 
      values[field] && values[field].toString().trim() !== ''
    );
  }
}

export default Messages;