<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiUrls, apiJson } from '$lib/api.js';
  import { auth } from '$lib/stores/auth.svelte.js';
  import { avaluosStore } from '$lib/stores/avaluos.svelte.js';
  import { cn, formatCRC, formatDate, debounce } from '$lib/utils.js';
  import { showSuccess, showError } from '$lib/utils/toast.js';
  import { confirmDelete, confirmDuplicate, confirmAction } from '$lib/utils/confirm.js';
  import { printCertificate } from '$lib/utils/certificate.js';
  // Papa Parse is loaded on demand inside exportCSV() — keeps it out of
  // the initial bundle for the most-visited page.
  import {
    Plus,
    RefreshCw,
    Search,
    Filter,
    Download,
    Trash2,
    Pencil,
    Copy,
    Printer,
    MoreHorizontal,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Checkbox from '$lib/components/ui/Checkbox.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
  import DropdownItem from '$lib/components/ui/DropdownItem.svelte';

  const store = avaluosStore;
  let s = $derived(store.state);

  let selected = $state(new Set());
  let showFilters = $state(false);
  let busyAction = $state(null); // {type:'cert'|'duplicate'|'delete', id}
  let dense = $state(true);

  let filterBrand = $state('');
  let filterModel = $state('');
  let filterYear = $state('');
  let filterFuel = $state('');
  let searchInput = $state('');
  let searchEl;

  const BASE_FUEL_TYPES = ['GASOLINA', 'DIESEL', 'HÍBRIDO', 'ELÉCTRICO', 'GAS NATURAL'];

  let fuelOptions = $derived(() => {
    const fromItems = s.items
      .map(it => (it.fuel_type ?? '').toUpperCase().trim())
      .filter(Boolean);
    const merged = new Set([...BASE_FUEL_TYPES, ...fromItems]);
    return [...merged].sort();
  });

  // Sync local filter inputs with the store (one-way: store -> inputs on initial load).
  let syncedOnce = false;
  $effect(() => {
    if (syncedOnce) return;
    filterBrand = s.filters.brand;
    filterModel = s.filters.model;
    filterYear = s.filters.year;
    filterFuel = s.filters.fuel;
    searchInput = s.search;
    syncedOnce = true;
  });

  onMount(() => {
    auth.hydrate();
    if (!auth.isAuthenticated) {
      goto('/login');
      return;
    }
    // Restore density preference.
    const saved = localStorage.getItem('avaluosDense');
    if (saved === '0') dense = false;
    // Always (re)load on mount — using the cached state for the first paint avoids flicker.
    store.load();

    function onKey(e) {
      // Ignore if user is typing in a field (except for some global keys).
      const tag = (e.target?.tagName ?? '').toLowerCase();
      const editing = ['input', 'textarea', 'select'].includes(tag) || e.target?.isContentEditable;
      if (e.key === '/' && !editing) {
        e.preventDefault();
        searchEl?.focus();
        searchEl?.select?.();
        return;
      }
      if (e.key === 'Escape' && document.activeElement === searchEl) {
        searchInput = '';
        store.setSearch('');
        searchEl?.blur();
        return;
      }
      if (editing) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        goto('/avaluos/nuevo');
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        refreshAll();
        return;
      }
      // Per-row shortcuts when exactly one item is selected via checkbox.
      if (selected.size === 1) {
        const onlyId = Array.from(selected)[0];
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          goto(`/avaluos/${onlyId}/editar`);
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          duplicateOne(onlyId);
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handlePrint(onlyId);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          deleteOne(onlyId);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avaluosDense', dense ? '1' : '0');
    }
  });

  const debouncedSearch = debounce((value) => {
    selected = new Set();
    store.setSearch(value);
  }, 350);

  function onSearchInput() {
    debouncedSearch(searchInput);
  }

  function toggleSort(column) {
    const same = s.sort.column === column;
    const direction = same && s.sort.direction === 'asc' ? 'desc' : same ? 'asc' : 'desc';
    selected = new Set();
    store.setSort(column, direction);
  }

  function applyFilters() {
    selected = new Set();
    store.setFilters({
      brand: filterBrand,
      model: filterModel,
      year: filterYear,
      fuel: filterFuel
    });
  }

  function clearFilters() {
    filterBrand = '';
    filterModel = '';
    filterYear = '';
    filterFuel = '';
    selected = new Set();
    store.setFilters({ brand: '', model: '', year: '', fuel: '' });
  }

  async function refreshAll() {
    searchInput = '';
    filterBrand = '';
    filterModel = '';
    filterYear = '';
    filterFuel = '';
    selected = new Set();
    await store.reset();
    showSuccess('Datos actualizados');
  }

  function toggleAll() {
    if (selected.size === s.items.length && s.items.length > 0) {
      selected = new Set();
    } else {
      selected = new Set(s.items.map((it) => it.vehicle_appraisal_id));
    }
  }

  function toggleOne(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
  }

  async function deleteOne(id) {
    const ok = await confirmDelete();
    if (!ok) return;
    try {
      busyAction = { type: 'delete', id };
      await apiJson(ApiUrls.AVALUOS.delete(id), { method: 'DELETE' });
      showSuccess('Avalúo eliminado');
      await store.load();
    } catch (e) {
      showError(e.message ?? 'No se pudo eliminar');
    } finally {
      busyAction = null;
    }
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const ok = await confirmAction({
      title: `¿Eliminar ${ids.length} avalúo(s)?`,
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'destructive'
    });
    if (!ok) return;
    try {
      await apiJson(ApiUrls.AVALUOS.bulkDelete, {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
      showSuccess(`${ids.length} avalúo(s) eliminado(s)`);
      selected = new Set();
      await store.load();
    } catch (e) {
      showError(e.message ?? 'No se pudo eliminar');
    }
  }

  async function duplicateOne(id) {
    const ok = await confirmDuplicate();
    if (!ok) return;
    try {
      busyAction = { type: 'duplicate', id };
      const created = await apiJson(ApiUrls.AVALUOS.duplicate(id), { method: 'POST' });
      const newId = created?.vehicle_appraisal_id ?? created?.id;
      showSuccess('Avalúo duplicado');
      if (newId) {
        // Lotus-style flow: jump straight to the editor of the new copy.
        goto(`/avaluos/${newId}/editar`);
        return;
      }
      await store.load();
    } catch (e) {
      showError(e.message ?? 'No se pudo duplicar');
    } finally {
      busyAction = null;
    }
  }

  async function handlePrint(id) {
    busyAction = { type: 'cert', id };
    try {
      await printCertificate(id);
    } finally {
      busyAction = null;
    }
  }

  async function exportCSV(scope = 'page') {
    const rows = scope === 'selection' ? s.items.filter((r) => selected.has(r.vehicle_appraisal_id)) : s.items;
    if (!rows.length) {
      showError('No hay registros para exportar');
      return;
    }
    const { default: Papa } = await import('papaparse');
    const data = rows.map((r) => ({
      ID: r.vehicle_appraisal_id,
      Certificado: r.cert ?? '',
      Fecha: r.appraisal_date ?? '',
      Solicitante: r.applicant ?? '',
      Propietario: r.owner ?? '',
      Marca: r.brand ?? '',
      Modelo: r.vehicle_description ?? '',
      Año: r.model_year ?? '',
      Color: r.color ?? '',
      Placa: r.plate_number ?? '',
      Kilometraje: r.mileage ?? '',
      VIN: r.vin ?? '',
      Valor_CRC: r.appraisal_value_trochez ?? '',
      Valor_USD: r.appraisal_value_usd ?? ''
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `avaluos_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(`${rows.length} registro(s) exportados`);
  }

  // Pagination derivations
  let totalPages = $derived(Math.max(1, Math.ceil(s.total / s.limit)));
  let pageStart = $derived(s.total === 0 ? 0 : (s.page - 1) * s.limit + 1);
  let pageEnd = $derived(Math.min(s.page * s.limit, s.total));
  let allSelected = $derived(s.items.length > 0 && selected.size === s.items.length);
  let someSelected = $derived(selected.size > 0 && selected.size < s.items.length);
  let activeFiltersCount = $derived(
    [s.filters.brand, s.filters.model, s.filters.year, s.filters.fuel].filter(Boolean).length
  );

  const columns = [
    { key: 'vehicle_appraisal_id', label: 'ID', sortable: true, align: 'left' },
    { key: 'cert', label: 'Cert.', sortable: false, align: 'left' },
    { key: 'appraisal_date', label: 'Fecha', sortable: true, align: 'left' },
    { key: 'applicant', label: 'Cliente', sortable: true, align: 'left' },
    { key: 'brand', label: 'Vehículo', sortable: true, align: 'left' },
    { key: 'model_year', label: 'Año', sortable: true, align: 'left' },
    { key: 'color', label: 'Color', sortable: false, align: 'left' },
    { key: 'plate_number', label: 'Placa', sortable: true, align: 'left' },
    { key: 'mileage', label: 'KM', sortable: false, align: 'right' },
    { key: 'appraisal_value_trochez', label: 'Valor ₡', sortable: true, align: 'right' },
    { key: 'appraisal_value_usd', label: 'Valor $', sortable: true, align: 'right' }
  ];

  // Density-driven cell paddings.
  let cellPadX = $derived(dense ? 'px-2.5' : 'px-3');
  let cellPadY = $derived(dense ? 'py-1.5' : 'py-3');
  let textSize = $derived(dense ? 'text-xs' : 'text-sm');
</script>

<div class="space-y-6">
  <!-- Page header -->
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Avalúos</h1>
      <p class="text-sm text-muted-foreground">
        {s.total} {s.total === 1 ? 'registro' : 'registros'} en total
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onclick={refreshAll}
        disabled={s.loading}
        title="Actualizar y limpiar filtros"
        aria-label="Actualizar"
      >
        {#if s.loading}
          <Spinner size={14} />
        {:else}
          <RefreshCw size={14} />
        {/if}
      </Button>
      <Button href="/avaluos/nuevo" class="shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25">
        <Plus size={16} />
        Nuevo avalúo
      </Button>
    </div>
  </div>

  <!-- Toolbar -->
  <Card class="p-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full md:max-w-sm">
        <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          bind:this={searchEl}
          bind:value={searchInput}
          oninput={onSearchInput}
          placeholder="Buscar… (presioná / para enfocar)"
          spellcheck="false"
          autocomplete="off"
          class="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
        {#if searchInput}
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
            onclick={() => {
              searchInput = '';
              store.setSearch('');
            }}
            aria-label="Limpiar"
          >
            <X size={14} />
          </button>
        {/if}
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onclick={() => (dense = !dense)}
          title={dense ? 'Cambiar a vista cómoda' : 'Cambiar a vista compacta'}
        >
          {dense ? 'Cómodo' : 'Compacto'}
        </Button>
        <Button variant="outline" size="sm" onclick={() => (showFilters = !showFilters)}>
          <Filter size={14} />
          Filtros
          {#if activeFiltersCount}
            <Badge class="ml-1 h-5 px-1.5 text-[10px]">{activeFiltersCount}</Badge>
          {/if}
        </Button>
        <Button variant="outline" size="sm" onclick={() => exportCSV('page')}>
          <Download size={14} /> Exportar CSV
        </Button>
      </div>
    </div>

    {#if showFilters}
      <div class="mt-4 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-brand">Marca</label>
          <Input id="f-brand" bind:value={filterBrand} placeholder="Toyota…" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-model">Modelo</label>
          <Input id="f-model" bind:value={filterModel} placeholder="Corolla…" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-year">Año</label>
          <Input id="f-year" bind:value={filterYear} placeholder="2020" inputmode="numeric" maxlength="4" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-fuel">Combustible</label>
          <select
            id="f-fuel"
            bind:value={filterFuel}
            class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="">Todos</option>
            {#each fuelOptions() as opt}
              <option value={opt}>{opt}</option>
            {/each}
          </select>
        </div>
        <div class="sm:col-span-2 md:col-span-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onclick={clearFilters}>Limpiar</Button>
          <Button size="sm" onclick={applyFilters}>Aplicar filtros</Button>
        </div>
      </div>
    {/if}
  </Card>

  <!-- Bulk action bar -->
  {#if selected.size > 0}
    <div class="flex items-center justify-between rounded-lg border bg-accent/40 px-4 py-2">
      <span class="text-sm font-medium">
        {selected.size} seleccionado{selected.size === 1 ? '' : 's'}
      </span>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" onclick={() => exportCSV('selection')}>
          <Download size={14} /> Exportar selección
        </Button>
        <Button variant="destructive" size="sm" onclick={bulkDelete}>
          <Trash2 size={14} /> Eliminar
        </Button>
      </div>
    </div>
  {/if}

  <!-- Table -->
  <Card class="overflow-hidden">
    <div class="relative w-full overflow-x-auto">
      <table class={cn('w-full caption-bottom', textSize)}>
        <thead class="bg-muted/40">
          <tr class="border-b">
            <th class={cn('w-9', cellPadX, cellPadY)}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onclick={toggleAll}
              />
            </th>
            {#each columns as col}
              <th
                class={cn(
                  'font-medium text-muted-foreground whitespace-nowrap',
                  cellPadX,
                  cellPadY,
                  col.align === 'right' && 'text-right'
                )}
              >
                {#if col.sortable}
                  <button
                    type="button"
                    onclick={() => toggleSort(col.key)}
                    class="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {col.label}
                    {#if s.sort.column === col.key}
                      {#if s.sort.direction === 'asc'}
                        <ArrowUp size={12} />
                      {:else}
                        <ArrowDown size={12} />
                      {/if}
                    {:else}
                      <ArrowUpDown size={12} class="opacity-40" />
                    {/if}
                  </button>
                {:else}
                  {col.label}
                {/if}
              </th>
            {/each}
            <th class={cn('sticky right-0 z-10 w-12 text-right bg-muted/40', cellPadX, cellPadY, 'shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.08)]')}>
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {#if s.loading && s.items.length === 0}
            {#each Array(8) as _, i}
              <tr class="border-b">
                <td class={cn(cellPadX, cellPadY)}><div class="h-4 w-4 rounded bg-muted animate-pulse"></div></td>
                {#each columns as _c}
                  <td class={cn(cellPadX, cellPadY)}>
                    <div class="h-3 w-3/4 rounded bg-muted animate-pulse"></div>
                  </td>
                {/each}
                <td></td>
              </tr>
            {/each}
          {:else if s.items.length === 0}
            <tr>
              <td colspan={columns.length + 2} class="px-3 py-16 text-center">
                <div class="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                  <Filter size={32} class="opacity-30" />
                  <p class="font-medium text-foreground">Sin avalúos</p>
                  <p class="text-sm">
                    {#if s.search || activeFiltersCount}
                      No hay resultados con los criterios actuales.
                    {:else}
                      Aún no se han creado avalúos.
                    {/if}
                  </p>
                  {#if s.search || activeFiltersCount}
                    <Button size="sm" variant="outline" onclick={clearFilters}>Limpiar filtros</Button>
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            {#each s.items as item (item.vehicle_appraisal_id)}
              {@const id = item.vehicle_appraisal_id}
              {@const isSelected = selected.has(id)}
              <tr
                class={cn('group border-b transition-colors hover:bg-muted/40 cursor-default', isSelected && 'bg-accent/30')}
                ondblclick={(e) => {
                  // Ignore double-click on interactive cells (checkbox, action menu).
                  if (e.target?.closest('button, a, [role="checkbox"], input')) return;
                  goto(`/avaluos/${id}/editar`);
                }}
                title="Doble-click para editar"
              >
                <td class={cn(cellPadX, cellPadY)}>
                  <Checkbox checked={isSelected} onclick={() => toggleOne(id)} />
                </td>
                <td class={cn('font-medium tabular-nums', cellPadX, cellPadY)}>{id}</td>
                <td class={cn('text-muted-foreground tabular-nums', cellPadX, cellPadY)}>{item.cert ?? '—'}</td>
                <td class={cn('text-muted-foreground whitespace-nowrap', cellPadX, cellPadY)}>{formatDate(item.appraisal_date)}</td>
                <td class={cn(cellPadX, cellPadY)}>
                  <div class="font-medium truncate max-w-[180px]" title={item.applicant ?? ''}>{item.applicant ?? '—'}</div>
                  {#if item.owner && item.owner !== item.applicant}
                    <div class="text-[11px] text-muted-foreground truncate max-w-[180px]" title={item.owner}>{item.owner}</div>
                  {/if}
                </td>
                <td class={cn(cellPadX, cellPadY)}>
                  <div class="font-medium truncate max-w-[200px]" title={`${item.brand ?? ''} ${item.vehicle_description ?? ''}`}>{item.brand ?? '—'}</div>
                  {#if item.vehicle_description}
                    <div class="text-[11px] text-muted-foreground truncate max-w-[200px]">{item.vehicle_description}</div>
                  {/if}
                </td>
                <td class={cn('tabular-nums text-muted-foreground', cellPadX, cellPadY)}>{item.model_year ?? '—'}</td>
                <td class={cn('text-muted-foreground whitespace-nowrap', cellPadX, cellPadY)}>{item.color ?? '—'}</td>
                <td class={cn(cellPadX, cellPadY)}>
                  {#if item.plate_number}
                    <Badge variant="outline">{item.plate_number}</Badge>
                  {:else}
                    —
                  {/if}
                </td>
                <td class={cn('text-right tabular-nums text-muted-foreground', cellPadX, cellPadY)}>
                  {item.mileage ? Number(item.mileage).toLocaleString('es-CR') : '—'}
                </td>
                <td class={cn('text-right tabular-nums font-medium whitespace-nowrap', cellPadX, cellPadY)}>
                  {item.appraisal_value_trochez ? formatCRC(item.appraisal_value_trochez) : '—'}
                </td>
                <td class={cn('text-right tabular-nums text-muted-foreground whitespace-nowrap', cellPadX, cellPadY)}>
                  {item.appraisal_value_usd ? `$${Number(item.appraisal_value_usd).toLocaleString('en-US')}` : '—'}
                </td>
                <td
                  class={cn(
                    'sticky right-0 text-right bg-background group-hover:bg-muted/40 transition-colors',
                    isSelected && 'bg-accent/30 group-hover:bg-accent/40',
                    cellPadX,
                    cellPadY,
                    'shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.08)]'
                  )}
                >
                  <DropdownMenu>
                    {#snippet trigger()}
                      <button
                        type="button"
                        class="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        aria-label="Acciones del avalúo"
                        title="Acciones"
                      >
                        {#if busyAction?.id === id}
                          <Spinner size={14} />
                        {:else}
                          <MoreHorizontal size={16} />
                        {/if}
                      </button>
                    {/snippet}
                    <DropdownItem href={`/avaluos/${id}/editar`}>
                      <Pencil size={14} />
                      <span class="flex-1 text-left">Editar</span>
                      <kbd class="text-[10px] text-muted-foreground/70">E</kbd>
                    </DropdownItem>
                    <DropdownItem onclick={() => duplicateOne(id)}>
                      <Copy size={14} />
                      <span class="flex-1 text-left">Duplicar y editar</span>
                      <kbd class="text-[10px] text-muted-foreground/70">D</kbd>
                    </DropdownItem>
                    <DropdownItem onclick={() => handlePrint(id)}>
                      <Printer size={14} />
                      <span class="flex-1 text-left">Imprimir certificado</span>
                      <kbd class="text-[10px] text-muted-foreground/70">P</kbd>
                    </DropdownItem>
                    <div class="my-1 h-px bg-border"></div>
                    <DropdownItem destructive onclick={() => deleteOne(id)}>
                      <Trash2 size={14} />
                      <span class="flex-1 text-left">Eliminar</span>
                      <kbd class="text-[10px] text-destructive/60">Del</kbd>
                    </DropdownItem>
                  </DropdownMenu>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </Card>

  <!-- Pagination -->
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div class="text-sm text-muted-foreground">
      {#if s.total === 0}
        0 registros
      {:else}
        Mostrando <span class="font-medium text-foreground">{pageStart}-{pageEnd}</span>
        de <span class="font-medium text-foreground">{s.total}</span>
      {/if}
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-muted-foreground">Filas por página</span>
      <Select
        value={String(s.limit)}
        onchange={(e) => store.setLimit(Number(e.currentTarget.value))}
        options={[10, 25, 50, 100].map((n) => ({ value: String(n), label: String(n) }))}
        placeholder={null}
        class="h-8 w-20 text-sm"
      />
      <Button
        variant="outline"
        size="icon"
        disabled={s.page === 1 || s.loading}
        onclick={() => store.setPage(1)}
        aria-label="Primera página"
      >
        <ChevronsLeft size={14} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={s.page === 1 || s.loading}
        onclick={() => store.setPage(s.page - 1)}
        aria-label="Anterior"
      >
        <ChevronLeft size={14} />
      </Button>
      <span class="text-sm tabular-nums">Página {s.page} de {totalPages}</span>
      <Button
        variant="outline"
        size="icon"
        disabled={s.page >= totalPages || s.loading}
        onclick={() => store.setPage(s.page + 1)}
        aria-label="Siguiente"
      >
        <ChevronRight size={14} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={s.page >= totalPages || s.loading}
        onclick={() => store.setPage(totalPages)}
        aria-label="Última página"
      >
        <ChevronsRight size={14} />
      </Button>
    </div>
  </div>

  <!-- Subtle keyboard hints (estilo Lotus power-user) -->
  <p class="hidden md:flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/80">
    <span class="inline-flex items-center gap-1"><kbd class="rounded border px-1 py-0.5 text-[10px] bg-muted/50">/</kbd> buscar</span>
    <span class="inline-flex items-center gap-1"><kbd class="rounded border px-1 py-0.5 text-[10px] bg-muted/50">N</kbd> nuevo</span>
    <span class="inline-flex items-center gap-1"><kbd class="rounded border px-1 py-0.5 text-[10px] bg-muted/50">R</kbd> actualizar</span>
    <span class="inline-flex items-center gap-1">
      <kbd class="rounded border px-1 py-0.5 text-[10px] bg-muted/50">E</kbd>
      <kbd class="rounded border px-1 py-0.5 text-[10px] bg-muted/50">D</kbd>
      <kbd class="rounded border px-1 py-0.5 text-[10px] bg-muted/50">P</kbd>
      con 1 fila seleccionada
    </span>
    <span class="inline-flex items-center gap-1">Doble-click en fila → editar</span>
  </p>
</div>
