import { API_BASE_URL } from './constants';

export class ApiUrls {
  static AUTH = {
    login: API_BASE_URL + '/api-security-signin',
    register: API_BASE_URL + '/api-security-signup'
  };

  static USERS = {
    getAll: API_BASE_URL + '/api-users',
    getById: (id) => API_BASE_URL + '/api-users/' + id,
    create: API_BASE_URL + '/api-users',
    update: (id) => API_BASE_URL + '/api-users/' + id,
    delete: (id) => API_BASE_URL + '/api-users/' + id
  };

  static AVALUOS = {
    getAll: API_BASE_URL + '/api-appraisals',
    getById: (id) => API_BASE_URL + '/api-appraisals/' + id,
    create: API_BASE_URL + '/api-appraisals',
    update: (id) => API_BASE_URL + '/api-appraisals/' + id,
    delete: (id) => API_BASE_URL + '/api-appraisals/' + id,
    search: API_BASE_URL + '/api-appraisals/search'
  };

  static CERTIFICADOS = {
    get: (vehicle_appraisal_id) => API_BASE_URL + '/certificates-appraisal/' + vehicle_appraisal_id
  };

  static DASHBOARD = {
    summary: API_BASE_URL + '/api-dashboard/summary',
    ventasDia: API_BASE_URL + '/api-dashboard/ventas-dia',
    ventasMes: API_BASE_URL + '/api-dashboard/ventas-mes',
    carrosMasAvaluos: API_BASE_URL + '/api-dashboard/carros-mas-avaluos'
  };

  static getCustomUrl(endpoint) {
    return API_BASE_URL + endpoint;
  }
}

export const apiFetch = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = localStorage.getItem('jwtToken');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return await fetch(url, { ...options, headers });
};
