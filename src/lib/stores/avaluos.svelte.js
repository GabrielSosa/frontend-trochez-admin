import { ApiUrls, apiJson } from '$lib/api.js';
import { suggestions } from './suggestions.svelte.js';

const initialState = () => ({
  items: [],
  total: 0,
  page: 1,
  limit: 25,
  search: '',
  sort: { column: 'vehicle_appraisal_id', direction: 'desc' },
  filters: { brand: '', model: '', year: '', fuel: '', engine: '', plate: '' },
  loading: false,
  lastFetched: 0,
  error: null
});

let state = $state(initialState());

function buildUrl() {
  const params = new URLSearchParams();
  params.set('page', String(state.page));
  params.set('limit', String(state.limit));
  if (state.search) params.set('q', state.search);
  if (state.sort.column) {
    params.set('orderBy', state.sort.column);
    params.set('orderDir', state.sort.direction);
  }
  if (state.filters.brand) params.set('brand', state.filters.brand);
  if (state.filters.model) params.set('model', state.filters.model);
  if (state.filters.year) params.set('year', state.filters.year);
  if (state.filters.fuel) params.set('fuel', state.filters.fuel);
  if (state.filters.engine) params.set('engine', state.filters.engine);
  if (state.filters.plate) params.set('plate', state.filters.plate);
  return `${ApiUrls.AVALUOS.getAll}?${params.toString()}`;
}

async function load() {
  state.loading = true;
  state.error = null;
  try {
    const data = await apiJson(buildUrl());
    state.items = Array.isArray(data.items) ? data.items : data ?? [];
    state.total = data.total ?? state.items.length;
    state.lastFetched = Date.now();
    // Feed the autocomplete bank with whatever values came back so the
    // /nuevo form has fresh suggestions even on the first visit.
    suggestions.ingestItems(state.items);
  } catch (e) {
    state.error = e.message ?? 'Error al cargar avalúos';
  } finally {
    state.loading = false;
  }
}

export const avaluosStore = {
  get state() {
    return state;
  },
  get items() {
    return state.items;
  },
  load,
  setPage(p) {
    state.page = p;
    return load();
  },
  setLimit(l) {
    state.limit = l;
    state.page = 1;
    return load();
  },
  setSearch(q) {
    state.search = q;
    state.page = 1;
    return load();
  },
  setSort(column, direction) {
    state.sort = { column, direction };
    return load();
  },
  setFilters(patch) {
    state.filters = { ...state.filters, ...patch };
    state.page = 1;
    return load();
  },
  reset() {
    state = initialState();
    return load();
  }
};
