<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte';
  import { ApiUrls, apiJson } from '$lib/api.js';
  import { auth } from '$lib/stores/auth.svelte.js';
  import { showError, showSuccess, showInfo } from '$lib/utils/toast.js';
  import { confirmCancel } from '$lib/utils/confirm.js';
  import { printCertificate } from '$lib/utils/certificate.js';
  import { draft } from '$lib/stores/draft.svelte.js';
  import { suggestions } from '$lib/stores/suggestions.svelte.js';
  import {
    validateAvaluoFormData,
    cleanAvaluoFormData,
    getDefaultAvaluoFormData
  } from '$lib/utils/avaluoUtils.js';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { Printer, ArrowLeft, ChevronLeft, Save, Trash2, RotateCcw } from 'lucide-svelte';

  let isSubmitting = $state(false);
  let validationErrors = $state({});
  let savedAvaluoId = $state(null);

  let formData = $state({
    ...getDefaultAvaluoFormData(),
    appraisal_date: new Date().toISOString().split('T')[0]
  });

  let draftRestored = $state(false);
  let lastSavedLabel = $state('');

  function formatSavedAt(iso) {
    if (!iso) return '';
    const then = new Date(iso);
    const diff = (Date.now() - then.getTime()) / 1000;
    if (diff < 60) return 'hace unos segundos';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    return then.toLocaleString('es-CR');
  }

  onMount(() => {
    auth.hydrate();
    if (!auth.isAuthenticated) {
      goto('/login');
      return;
    }
    // AvaluoForm hydrates suggestions and bootstraps from the backend; just load the draft.
    draft.hydrate();
    if (draft.hasContent) {
      // Auto-restore the draft and let the user know. If they want a clean
      // form, the "Descartar borrador" button wipes it.
      formData = { ...formData, ...draft.data };
      draftRestored = true;
      lastSavedLabel = formatSavedAt(draft.savedAt);
      showInfo('Borrador restaurado');
    }

    const tick = setInterval(() => {
      if (draft.savedAt) lastSavedLabel = formatSavedAt(draft.savedAt);
    }, 30_000);

    // Flush the draft synchronously on reload/close so an early F5 doesn't
    // lose data still sitting in the debounce timer.
    const flushOnUnload = () => {
      if (!savedAvaluoId) draft.flush(formData);
    };
    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);

    return () => {
      clearInterval(tick);
      window.removeEventListener('beforeunload', flushOnUnload);
      window.removeEventListener('pagehide', flushOnUnload);
    };
  });

  // Persist draft whenever the form changes (debounced inside the store).
  // We snapshot the proxy so the timer callback captures plain data, not
  // the live state object.
  $effect(() => {
    if (savedAvaluoId) return; // already committed → nothing to save
    draft.saveDebounced(formData);
  });

  async function handleSubmit() {
    isSubmitting = true;
    validationErrors = {};
    try {
      const errs = validateAvaluoFormData(formData, false);
      const cleaned = Object.fromEntries(Object.entries(errs).filter(([, v]) => v));
      if (Object.keys(cleaned).length > 0) {
        validationErrors = cleaned;
        throw new Error('Por favor corrija los errores de validación.');
      }
      const body = cleanAvaluoFormData(formData);
      const result = await apiJson(ApiUrls.AVALUOS.create, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      savedAvaluoId = result.vehicle_appraisal_id ?? result.id;
      // Remember the typed values for future autocomplete, then drop the draft.
      suggestions.remember(formData);
      draft.clear();
      lastSavedLabel = '';
      draftRestored = false;
      showSuccess('Avalúo guardado correctamente');
    } catch (err) {
      if (err?.data?.detail && Array.isArray(err.data.detail)) {
        const next = {};
        for (const e of err.data.detail) {
          const field = e.loc?.[e.loc.length - 1];
          if (field) next[field] = e.msg;
        }
        validationErrors = next;
      }
      showError(err.message || 'No se pudo guardar el avalúo');
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCancel() {
    const ok = await confirmCancel();
    if (ok) {
      draft.clear();
      goto('/avaluos');
    }
  }

  function discardDraft() {
    draft.clear();
    formData = {
      ...getDefaultAvaluoFormData(),
      appraisal_date: new Date().toISOString().split('T')[0]
    };
    draftRestored = false;
    lastSavedLabel = '';
    showInfo('Borrador descartado');
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" href="/avaluos" aria-label="Volver">
        <ChevronLeft size={18} />
      </Button>
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Nuevo avalúo</h1>
        <p class="text-sm text-muted-foreground">Registrá un nuevo avalúo vehicular</p>
      </div>
    </div>
    {#if !savedAvaluoId && lastSavedLabel}
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <Save size={12} />
        <span>Borrador guardado {lastSavedLabel}</span>
        <button
          type="button"
          onclick={discardDraft}
          class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] hover:bg-accent"
          title="Descartar borrador y empezar de cero"
        >
          <Trash2 size={11} /> Descartar
        </button>
      </div>
    {/if}
  </div>

  {#if draftRestored && !savedAvaluoId}
    <Card class="border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center gap-2">
          <RotateCcw size={14} /> Se restauró un borrador que tenías sin guardar.
        </span>
        <button
          type="button"
          onclick={discardDraft}
          class="text-xs underline hover:no-underline"
        >Descartar y empezar de cero</button>
      </div>
    </Card>
  {/if}

  {#if savedAvaluoId}
    <Card class="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p class="font-medium">Avalúo #{savedAvaluoId} guardado correctamente.</p>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" onclick={() => printCertificate(savedAvaluoId)}>
            <Printer size={14} /> Imprimir certificado
          </Button>
          <Button size="sm" href="/avaluos">
            <ArrowLeft size={14} /> Volver a lista
          </Button>
        </div>
      </div>
    </Card>
  {/if}

  <AvaluoForm
    bind:formData
    {validationErrors}
    {isSubmitting}
    isEdit={false}
    onsubmit={handleSubmit}
    oncancel={handleCancel}
  />
</div>
