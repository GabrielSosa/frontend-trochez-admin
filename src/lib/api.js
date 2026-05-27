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
    bulkDelete: API_BASE_URL + '/api-appraisals/bulk-delete',
    search: API_BASE_URL + '/api-appraisals/search',
    duplicate: (id) => API_BASE_URL + '/api-appraisals/' + id + '/duplicate'
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

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwtToken');
}

/**
 * Low-level fetch wrapper that injects the JWT and a JSON content type.
 * Returns the raw Response — caller decides how to read it.
 */
export const apiFetch = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return await fetch(url, { ...options, headers });
};

/**
 * JSON fetch helper: parses the response, throws an Error with `.status` and `.data` on non-2xx.
 * Handles 401 by clearing the session and redirecting to /login.
 */
export async function apiJson(url, options = {}) {
  const res = await apiFetch(url, options);
  let data = null;
  const ct = res.headers.get('content-type') ?? '';
  try {
    data = ct.includes('application/json') ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userData');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  }

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Error ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
