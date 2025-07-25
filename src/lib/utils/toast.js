import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

// Configuración por defecto para las notificaciones
const defaultConfig = {
  duration: 4000,
  gravity: 'top',
  position: 'right',
  stopOnFocus: true,
  close: true,
  style: {
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
  }
};

// Función para mostrar notificación de éxito
export function showSuccess(message, duration = 4000) {
  Toastify({
    ...defaultConfig,
    text: message,
    duration: duration,
    style: {
      ...defaultConfig.style,
      background: '#10b981', // Verde
      color: '#ffffff',
    }
  }).showToast();
}

// Función para mostrar notificación de error
export function showError(message, duration = 6000) {
  Toastify({
    ...defaultConfig,
    text: message,
    duration: duration,
    style: {
      ...defaultConfig.style,
      background: '#ef4444', // Rojo
      color: '#ffffff',
    }
  }).showToast();
}

// Función para mostrar notificación de advertencia
export function showWarning(message, duration = 5000) {
  Toastify({
    ...defaultConfig,
    text: message,
    duration: duration,
    style: {
      ...defaultConfig.style,
      background: '#f59e0b', // Amarillo
      color: '#ffffff',
    }
  }).showToast();
}

// Función para mostrar notificación de información
export function showInfo(message, duration = 4000) {
  Toastify({
    ...defaultConfig,
    text: message,
    duration: duration,
    style: {
      ...defaultConfig.style,
      background: '#3b82f6', // Azul
      color: '#ffffff',
    }
  }).showToast();
}

// Función para mostrar notificación personalizada
export function showToast(message, options = {}) {
  Toastify({
    ...defaultConfig,
    ...options,
    text: message,
  }).showToast();
} 