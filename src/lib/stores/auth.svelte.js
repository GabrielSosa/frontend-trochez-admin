// Auth session held in a runes-backed module-scoped store.
// Lives only in memory; we hydrate from localStorage on first read.
let token = $state(null);
let user = $state(null);
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  token = localStorage.getItem('jwtToken');
  const raw = localStorage.getItem('userData');
  try {
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }
  hydrated = true;
}

export const auth = {
  get token() {
    hydrate();
    return token;
  },
  get user() {
    hydrate();
    return user;
  },
  get isAuthenticated() {
    hydrate();
    return !!token;
  },
  setSession(t, u) {
    token = t;
    user = u;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwtToken', t);
      if (u) localStorage.setItem('userData', JSON.stringify(u));
    }
  },
  clearSession() {
    token = null;
    user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userData');
    }
  }
};
