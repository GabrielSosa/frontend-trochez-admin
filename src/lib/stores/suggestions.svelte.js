// Per-field suggestion bank fed from previous appraisals. We only collect
// strings the user has already typed (no PII leaks to the server), and
// persist them to localStorage so suggestions survive reloads.

const STORAGE_KEY = 'avaluoSuggestions';
const MAX_PER_FIELD = 200;

const FIELDS = [
  'brand',
  'vehicle_description',
  'color',
  'fuel_type',
  'applicant',
  'owner',
  'extras'
];

let buckets = $state(Object.fromEntries(FIELDS.map((f) => [f, []])));
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    for (const f of FIELDS) {
      if (Array.isArray(obj?.[f])) buckets[f] = obj[f].slice(0, MAX_PER_FIELD);
    }
  } catch {
    /* ignore malformed cache */
  }
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));
  } catch {
    /* quota — ignore */
  }
}

function normalize(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function ingestOne(field, value) {
  const v = normalize(value);
  if (!v) return false;
  const current = buckets[field] ?? [];
  const idx = current.findIndex((x) => x.toLowerCase() === v.toLowerCase());
  if (idx === 0) return false; // already at the top
  // Always build a brand-new array so the $derived that reads this bucket
  // re-evaluates without relying on in-place array mutation tracking.
  const next = idx > 0
    ? [v, ...current.slice(0, idx), ...current.slice(idx + 1)]
    : [v, ...current];
  buckets[field] = next.slice(0, MAX_PER_FIELD);
  return true;
}

export const suggestions = {
  hydrate,
  /** Read the unique sorted list of suggestions for a field. */
  get(field) {
    hydrate();
    return [...(buckets[field] ?? [])];
  },
  /** Feed the bank from a list of appraisals (e.g. when /avaluos loads). */
  ingestItems(items) {
    if (!Array.isArray(items) || items.length === 0) return;
    hydrate();
    let changed = false;
    for (const item of items) {
      for (const field of FIELDS) {
        if (ingestOne(field, item[field])) changed = true;
      }
    }
    if (changed) persist();
  },
  /** Manually remember a value (e.g. after saving a new avalúo). */
  remember(formData) {
    if (!formData) return;
    hydrate();
    let changed = false;
    for (const field of FIELDS) {
      if (ingestOne(field, formData[field])) changed = true;
    }
    if (changed) persist();
  }
};
