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
  import Papa from 'papaparse';
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

  let filterBrand = $state('');
  let filterColor = $state('');
  let filterFrom = $state('');
  let filterTo = $state('');
  let searchInput = $state('');

  // Sync local filter inputs with the store (one-way: store -> inputs on initial load).
  let syncedOnce = false;
  $effect(() => {
    if (syncedOnce) return;
    filterBrand = s.filters.brand;
    filterColor = s.filters.color;
    filterFrom = s.filters.from;
    filterTo = s.filters.to;
    searchInput = s.search;
    syncedOnce = true;
  });

  onMount(() => {
    if (!auth.isAuthenticated) {
      goto('/login');
      return;
    }
    // Always (re)load on mount — using the cached state for the first paint avoids flicker.
    store.load();
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
      color: filterColor,
      from: filterFrom,
      to: filterTo
    });
  }

  function clearFilters() {
    filterBrand = '';
    filterColor = '';
    filterFrom = '';
    filterTo = '';
    selected = new Set();
    store.setFilters({ brand: '', color: '', from: '', to: '' });
  }

  async function refreshAll() {
    searchInput = '';
    filterBrand = '';
    filterColor = '';
    filterFrom = '';
    filterTo = '';
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
      await apiJson(ApiUrls.AVALUOS.duplicate(id), { method: 'POST' });
      showSuccess('Avalúo duplicado');
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

  function exportCSV(scope = 'page') {
    const rows = scope === 'selection' ? s.items.filter((r) => selected.has(r.vehicle_appraisal_id)) : s.items;
    if (!rows.length) {
      showError('No hay registros para exportar');
      return;
    }
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
    [s.filters.brand, s.filters.color, s.filters.from, s.filters.to].filter(Boolean).length
  );

  const columns = [
    { key: 'vehicle_appraisal_id', label: 'ID', sortable: true, align: 'left' },
    { key: 'cert', label: 'Cert.', sortable: false, align: 'left' },
    { key: 'appraisal_date', label: 'Fecha', sortable: true, align: 'left' },
    { key: 'applicant', label: 'Cliente', sortable: true, align: 'left' },
    { key: 'brand', label: 'Vehículo', sortable: true, align: 'left' },
    { key: 'plate_number', label: 'Placa', sortable: true, align: 'left' },
    { key: 'appraisal_value_trochez', label: 'Valor', sortable: true, align: 'right' }
  ];
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
      <Button href="/avaluos/nuevo">
        <Plus size={16} /> Nuevo avalúo
      </Button>
    </div>
  </div>

  <!-- Toolbar -->
  <Card class="p-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full md:max-w-sm">
        <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          bind:value={searchInput}
          oninput={onSearchInput}
          placeholder="Buscar por placa, propietario, VIN, marca…"
          class="pl-9 pr-9"
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
      <div class="mt-4 grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-brand">Marca</label>
          <Input id="f-brand" bind:value={filterBrand} placeholder="Toyota…" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-color">Color</label>
          <Input id="f-color" bind:value={filterColor} placeholder="Negro…" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-from">Desde</label>
          <Input id="f-from" bind:value={filterFrom} type="date" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground" for="f-to">Hasta</label>
          <Input id="f-to" bind:value={filterTo} type="date" />
        </div>
        <div class="md:col-span-4 flex justify-end gap-2">
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
      <table class="w-full caption-bottom text-sm">
        <thead class="bg-muted/40">
          <tr class="border-b">
            <th class="w-10 px-3 py-2.5">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onclick={toggleAll}
              />
            </th>
            {#each columns as col}
              <th
                class={cn(
                  'px-3 py-2.5 font-medium text-muted-foreground',
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
            <th class="w-10 px-3 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {#if s.loading && s.items.length === 0}
            {#each Array(6) as _, i}
              <tr class="border-b">
                <td class="px-3 py-3"><div class="h-4 w-4 rounded bg-muted animate-pulse"></div></td>
                {#each columns as _c}
                  <td class="px-3 py-3">
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
              <tr class={cn('border-b transition-colors hover:bg-muted/30', isSelected && 'bg-accent/30')}>
                <td class="px-3 py-3">
                  <Checkbox checked={isSelected} onclick={() => toggleOne(id)} />
                </td>
                <td class="px-3 py-3 font-medium tabular-nums">{id}</td>
                <td class="px-3 py-3 text-muted-foreground tabular-nums">{item.cert ?? '—'}</td>
                <td class="px-3 py-3 text-muted-foreground">{formatDate(item.appraisal_date)}</td>
                <td class="px-3 py-3">
                  <div class="font-medium">{item.applicant ?? '—'}</div>
                  {#if item.owner && item.owner !== item.applicant}
                    <div class="text-xs text-muted-foreground">{item.owner}</div>
                  {/if}
                </td>
                <td class="px-3 py-3">
                  <div class="font-medium">{item.brand ?? '—'}</div>
                  {#if item.vehicle_description}
                    <div class="text-xs text-muted-foreground">{item.vehicle_description} {item.model_year ?? ''}</div>
                  {/if}
                </td>
                <td class="px-3 py-3">
                  {#if item.plate_number}
                    <Badge variant="outline">{item.plate_number}</Badge>
                  {:else}
                    —
                  {/if}
                </td>
                <td class="px-3 py-3 text-right tabular-nums font-medium">
                  {item.appraisal_value_trochez ? formatCRC(item.appraisal_value_trochez) : '—'}
                </td>
                <td class="px-3 py-3 text-right">
                  <DropdownMenu>
                    {#snippet trigger()}
                      <button
                        type="button"
                        class="rounded-md p-1.5 hover:bg-accent"
                        aria-label="Acciones"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    {/snippet}
                    <DropdownItem href={`/avaluos/${id}/editar`}>
                      <Pencil size={14} /> Editar
                    </DropdownItem>
                    <DropdownItem onclick={() => handlePrint(id)}>
                      {#if busyAction?.type === 'cert' && busyAction.id === id}
                        <Spinner size={14} />
                      {:else}
                        <Printer size={14} />
                      {/if}
                      Certificado
                    </DropdownItem>
                    <DropdownItem onclick={() => duplicateOne(id)}>
                      <Copy size={14} /> Duplicar
                    </DropdownItem>
                    <DropdownItem destructive onclick={() => deleteOne(id)}>
                      <Trash2 size={14} /> Eliminar
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
</div>
