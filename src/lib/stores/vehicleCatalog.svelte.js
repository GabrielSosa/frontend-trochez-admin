// Public vehicle catalog (makes + models) pulled from NHTSA vPIC and pre-baked
// into /static/vehicles.json (~35KB, ~3k models across 66 makes). Served as a
// static asset so the page can pull it in one request with no auth.

let catalog = $state(null); // { makes: string[], models: { [make]: string[] } }
let loading = false;
let loaded = false;

async function ensureLoaded() {
  if (loaded || loading || typeof window === 'undefined') return;
  loading = true;
  try {
    const res = await fetch('/vehicles.json');
    if (!res.ok) return;
    catalog = await res.json();
    loaded = true;
  } catch {
    /* leave catalog null — datalists fall back to user history only */
  } finally {
    loading = false;
  }
}

export const vehicleCatalog = {
  ensureLoaded,
  get makes() {
    return catalog?.makes ?? [];
  },
  modelsFor(brand) {
    if (!brand || !catalog?.models) return [];
    const key = String(brand).trim().toUpperCase();
    // Direct hit
    if (catalog.models[key]) return catalog.models[key];
    // Lenient: try removing punctuation (e.g. "MERCEDES BENZ" → "MERCEDESBENZ").
    const compact = key.replace(/[^A-Z0-9]/g, '');
    for (const [k, v] of Object.entries(catalog.models)) {
      if (k.replace(/[^A-Z0-9]/g, '') === compact) return v;
    }
    return [];
  }
};
