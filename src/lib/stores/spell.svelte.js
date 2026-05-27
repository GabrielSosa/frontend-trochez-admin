// Lazy Spanish spellchecker (Typo.js + Hunspell `es`) augmented with an
// automotive / Costa Rica domain glossary so the suggestions feel relevant
// to the avalúos workflow. The store exposes a single `check()` + `suggest()`
// API; UI components decide how to render hints.

import { AUTOMOTIVE_GLOSSARY } from './spell-glossary.js';

let typo = $state(null);
let ready = $state(false);
let loading = $state(false);
let error = $state(null);

// Lowercase set for O(1) lookup; stripped of accents to match a normalized
// form too.
const glossary = new Set();
const glossaryNoAccent = new Set();
function normalize(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
for (const w of AUTOMOTIVE_GLOSSARY) {
  glossary.add(w.toLowerCase());
  glossaryNoAccent.add(normalize(w));
}

const suggestionCache = new Map();

function cleanWord(raw) {
  if (!raw) return '';
  return raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

async function init() {
  if (ready || loading || typeof window === 'undefined') return;
  loading = true;
  try {
    const [{ default: Typo }, affRes, dicRes] = await Promise.all([
      import('typo-js'),
      fetch('/dict/es.aff'),
      fetch('/dict/es.dic')
    ]);
    if (!affRes.ok || !dicRes.ok) throw new Error('Diccionario no disponible');
    const [aff, dic] = await Promise.all([affRes.text(), dicRes.text()]);
    typo = new Typo('es', aff, dic, { platform: 'any' });
    ready = true;
  } catch (e) {
    error = e?.message ?? 'Diccionario no disponible';
  } finally {
    loading = false;
  }
}

function isKnown(word) {
  if (!word) return true;
  const w = cleanWord(word);
  if (!w || w.length < 3) return true;
  if (/\d/.test(w)) return true; // mixed alphanumeric → likely a code/model
  const lower = w.toLowerCase();
  if (glossary.has(lower) || glossaryNoAccent.has(normalize(lower))) return true;
  if (!typo) return true; // dictionary not loaded yet → don't flag
  return typo.check(w) || typo.check(lower);
}

function suggest(word, limit = 3) {
  if (!word) return [];
  const w = cleanWord(word);
  if (!w || w.length < 3 || /\d/.test(w)) return [];
  const key = w.toLowerCase();
  if (suggestionCache.has(key)) return suggestionCache.get(key).slice(0, limit);

  const seen = new Set();
  const out = [];
  const push = (candidate) => {
    if (!candidate) return;
    const norm = candidate.toLowerCase();
    if (seen.has(norm)) return;
    seen.add(norm);
    out.push(candidate);
  };

  // Glossary matches by normalized prefix (cheap but high-signal).
  const wNorm = normalize(w);
  for (const term of AUTOMOTIVE_GLOSSARY) {
    const tNorm = normalize(term);
    if (tNorm === wNorm) continue; // already correct
    if (tNorm.startsWith(wNorm) || levenshtein(tNorm, wNorm) <= 2) {
      push(term);
      if (out.length >= limit) break;
    }
  }

  if (out.length < limit && typo) {
    for (const s of typo.suggest(w, limit) ?? []) {
      push(s);
      if (out.length >= limit) break;
    }
  }

  const result = out.slice(0, limit);
  suggestionCache.set(key, result);
  return result;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Array(b.length + 1);
  const v1 = new Array(b.length + 1);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a.charCodeAt(i) === b.charCodeAt(j) ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
}

export const spell = {
  get ready() {
    return ready;
  },
  get loading() {
    return loading;
  },
  get error() {
    return error;
  },
  init,
  isKnown,
  suggest
};
