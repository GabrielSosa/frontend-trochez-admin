// Auth session held in runes. We never mutate `$state` from inside a getter
// (that would throw `state_unsafe_mutation`), so hydration is explicit and
// triggered once by the root layout via `auth.hydrate()` on mount.

let token = $state(null);
let user = $state(null);
let hydrated = false;

export const auth = {
  get token() {
    return token;
  },
  get user() {
    return user;
  },
  get isAuthenticated() {
    return !!token;
  },
  /** Idempotent — reads localStorage and seeds the runes. Call from the
   *  client only (e.g. in `onMount`). */
  hydrate() {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    token = localStorage.getItem('jwtToken');
    const raw = localStorage.getItem('userData');
    try {
      user = raw ? JSON.parse(raw) : null;
    } catch {
      user = null;
    }
  },
  setSession(t, u) {
    token = t;
    user = u ?? null;
    hydrated = true;
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
