import { API_BASE_URL } from './constants';

/**
 * Clase para manejar las URLs de las APIs
 * Esta clase permite centralizar y reutilizar las URLs de las APIs en toda la aplicación
 */
export class ApiUrls {
  // URLs de autenticación
  static AUTH = {
    login: `${API_BASE_URL}/api/security/signin`,
    register: `${API_BASE_URL}/api/security/signup`
  };

  // URLs para usuarios
  static USERS = {
    getAll: `${API_BASE_URL}/api/users`,
    getById: (id) => `${API_BASE_URL}/api/users/${id}`,
    create: `${API_BASE_URL}/api/users`,
    update: (id) => `${API_BASE_URL}/api/users/${id}`,
    delete: (id) => `${API_BASE_URL}/api/users/${id}`
  };

  // URLs para avalúos
  static AVALUOS = {
    getAll: `${API_BASE_URL}/api/appraisals`,
    getById: (id) => `${API_BASE_URL}/api/appraisals/${id}`,
    create: `${API_BASE_URL}/api/appraisals`,
    update: (id) => `${API_BASE_URL}/api/appraisals/${id}`,
    delete: (id) => `${API_BASE_URL}/api/appraisals/${id}`
  };

  // URLs para CERTIFICADOS
  static CERTIFICADOS = {
    get: (vehicle_appraisal_id) => `${API_BASE_URL}/certificates/appraisal/${vehicle_appraisal_id}`
  };

  // Método para obtener URLs personalizadas
  static getCustomUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
  }
}

// También exportamos una instancia de fetch configurada para usar con las APIs
export const apiFetch = async (url, options = {}) => {
  // Configuración por defecto
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Agregar token de autenticación si existe
  try {
    const token = localStorage.getItem('jwtToken');
    if (token && token !== 'undefined' && token !== 'null') {
      // Asegurarse de que el token tenga el formato correcto
      if (!token.startsWith('Bearer ')) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
      } else {
        defaultOptions.headers.Authorization = token;
      }
    } else {
      // Si estamos intentando acceder a una ruta protegida sin token, redirigir al login
      if (!url.includes('/signin') && !url.includes('/signup')) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 100);
      }
    }
  } catch (e) {}

  // Combinar opciones
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  // Realizar la petición
  const response = await fetch(url, fetchOptions);
  
  // Si la respuesta no es exitosa, lanzar un error
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'Error en la petición');
    error.status = response.status;
    error.data = errorData;
    
    // Si es un error de autenticación, limpiar el token y redirigir al login
    if (response.status === 401) {
      localStorage.removeItem('jwtToken');
      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }, 100);
    }
    
    throw error;
  }
  
  // Si la respuesta es exitosa, devolver los datos
  return await response.json();
};
