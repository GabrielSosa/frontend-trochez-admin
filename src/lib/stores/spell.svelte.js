// Lazy Spanish spellchecker backed by Typo.js + a Hunspell dictionary served
// from `/dict/`. The whole thing is wrapped in a runes-aware store so any
// component can render based on `spell.ready` without imperative wiring.

let typo = $state(null);
let ready = $state(false);
let loading = $state(false);
let error = $state(null);

const suggestionCache = new Map(); // word -> string[]

function cleanWord(raw) {
  if (!raw) return '';
  // Strip leading/trailing punctuation while keeping accents & ñ.
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
    if (!affRes.ok || !dicRes.ok) throw new Error('No se pudo cargar el diccionario');
    const [aff, dic] = await Promise.all([affRes.text(), dicRes.text()]);
    typo = new Typo('es', aff, dic, { platform: 'any' });
    ready = true;
  } catch (e) {
    error = e?.message ?? 'Diccionario no disponible';
  } finally {
    loading = false;
  }
}

function check(word) {
  if (!typo) return true;
  const w = cleanWord(word);
  if (!w || w.length < 2) return true;
  // Numbers and codes (mix of digits/letters) are not spell-checked.
  if (/\d/.test(w)) return true;
  return typo.check(w) || typo.check(w.toLowerCase());
}

function suggest(word, limit = 6) {
  if (!typo) return [];
  const w = cleanWord(word);
  if (!w || w.length < 2 || /\d/.test(w)) return [];
  if (suggestionCache.has(w)) return suggestionCache.get(w).slice(0, limit);
  const list = typo.suggest(w, limit) ?? [];
  suggestionCache.set(w, list);
  return list.slice(0, limit);
}

/** Words/typeahead matches for the *prefix* being typed. Combines exact
 *  suggestions when misspelled with completions when the prefix is valid. */
function complete(prefix, limit = 6) {
  if (!typo || !prefix) return [];
  const p = cleanWord(prefix);
  if (p.length < 2 || /\d/.test(p)) return [];

  const out = [];
  const seen = new Set();
  const push = (w) => {
    if (!w) return;
    const key = w.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(w);
  };

  // If the prefix itself is a valid word, the user might be done — still offer
  // suggest() output (often returns related forms / inflections).
  const valid = typo.check(p) || typo.check(p.toLowerCase());
  if (!valid) {
    for (const s of suggest(p, limit)) push(s);
  }

  // Typo.js doesn't expose a prefix iterator; we fake completions by treating
  // the prefix + common Spanish endings and letting check() filter. Cheap and
  // covers the common "user is mid-word" case without indexing the .dic file.
  if (out.length < limit) {
    const lower = p.toLowerCase();
    const endings = ['', 'a', 'o', 'e', 'as', 'os', 'es', 'ar', 'er', 'ir', 'ado', 'ido', 'mente'];
    for (const end of endings) {
      const cand = lower + end;
      if (cand !== lower && (typo.check(cand) || typo.check(cand.charAt(0).toUpperCase() + cand.slice(1)))) {
        push(cand);
        if (out.length >= limit) break;
      }
    }
  }

  return out.slice(0, limit);
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
  check,
  suggest,
  complete
};
