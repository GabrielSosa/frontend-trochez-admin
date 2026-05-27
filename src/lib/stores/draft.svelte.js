// Auto-save the in-progress "nuevo avalúo" form to localStorage so an
// accidental reload doesn't lose typed data. Only used in /avaluos/nuevo
// (the edit page already has its row on the server).

const STORAGE_KEY = 'avaluoNewDraft';

let data = $state(null);
let savedAt = $state(null);
let hydrated = false;
let timer;

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') {
      data = obj.data ?? null;
      savedAt = obj.savedAt ?? null;
    }
  } catch {
    /* ignore */
  }
}

function persist() {
  if (typeof window === 'undefined') return;
  if (!data) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  savedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, savedAt }));
  } catch {
    /* quota — ignore */
  }
}

function isEmptyDraft(d) {
  if (!d || typeof d !== 'object') return true;
  const ignore = new Set([
    'appraisal_date',
    'validity_days',
    'validity_kms',
    'fuel_type',
    'vehicle_appraisal_id',
    'id'
  ]);
  for (const [k, v] of Object.entries(d)) {
    if (ignore.has(k)) continue;
    if (Array.isArray(v)) {
      if (v.length > 0) {
        for (const ded of v) {
          if (ded?.description || (ded?.amount && Number(ded.amount) !== 0)) return false;
        }
      }
      continue;
    }
    if (v !== '' && v !== null && v !== undefined && v !== 0) return false;
  }
  return true;
}

export const draft = {
  hydrate,
  get data() {
    hydrate();
    return data;
  },
  get savedAt() {
    hydrate();
    return savedAt;
  },
  /** Has the current saved draft any meaningful data? */
  get hasContent() {
    hydrate();
    return !isEmptyDraft(data);
  },
  /** Save immediately (used on the first paint when there's nothing to debounce). */
  save(formData) {
    hydrate();
    data = formData ? structuredClone($state.snapshot(formData)) : null;
    persist();
  },
  /** Debounced save — call from a `$effect` in the form page. */
  saveDebounced(formData) {
    clearTimeout(timer);
    timer = setTimeout(() => this.save(formData), 250);
  },
  /** Flush any pending debounced write immediately (used on beforeunload). */
  flush(formData) {
    clearTimeout(timer);
    this.save(formData);
  },
  /** Clear the draft (after successful submit or explicit discard). */
  clear() {
    clearTimeout(timer);
    data = null;
    savedAt = null;
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }
};
