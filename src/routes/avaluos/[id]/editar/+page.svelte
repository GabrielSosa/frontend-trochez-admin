<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte';
  import { ApiUrls, apiJson } from '$lib/api.js';
  import { auth } from '$lib/stores/auth.svelte.js';
  import { showError, showSuccess } from '$lib/utils/toast.js';
  import { confirmCancel } from '$lib/utils/confirm.js';
  import { printCertificate } from '$lib/utils/certificate.js';
  import {
    validateAvaluoFormData,
    cleanAvaluoFormData,
    getDefaultAvaluoFormData,
    mapApiDataToFormData
  } from '$lib/utils/avaluoUtils.js';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { Printer, ArrowLeft, ChevronLeft } from 'lucide-svelte';

  let avaluoId = $derived($page.params.id);
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let validationErrors = $state({});
  let formData = $state(getDefaultAvaluoFormData());
  let loadError = $state('');

  onMount(async () => {
    if (!auth.isAuthenticated) {
      goto('/login');
      return;
    }
    isLoading = true;
    try {
      const data = await apiJson(ApiUrls.AVALUOS.getById(avaluoId));
      formData = mapApiDataToFormData(data);
    } catch (err) {
      loadError = err.message ?? 'No se pudo cargar el avalúo';
      if (err.status === 404) {
        setTimeout(() => goto('/avaluos'), 2000);
      }
    } finally {
      isLoading = false;
    }
  });

  async function handleSubmit() {
    isSubmitting = true;
    validationErrors = {};
    try {
      const errs = validateAvaluoFormData(formData, true);
      const cleaned = Object.fromEntries(Object.entries(errs).filter(([, v]) => v));
      if (Object.keys(cleaned).length > 0) {
        validationErrors = cleaned;
        throw new Error('Por favor corrija los errores de validación.');
      }
      const body = cleanAvaluoFormData(formData);
      await apiJson(ApiUrls.AVALUOS.update(avaluoId), {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      showSuccess('Avalúo actualizado correctamente');
    } catch (err) {
      if (err?.data?.detail && Array.isArray(err.data.detail)) {
        const next = {};
        for (const e of err.data.detail) {
          const field = e.loc?.[e.loc.length - 1];
          if (field) next[field] = e.msg;
        }
        validationErrors = next;
      }
      showError(err.message || 'No se pudo actualizar el avalúo');
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCancel() {
    const ok = await confirmCancel();
    if (ok) goto('/avaluos');
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" href="/avaluos" aria-label="Volver">
        <ChevronLeft size={18} />
      </Button>
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Editar avalúo #{avaluoId}</h1>
        <p class="text-sm text-muted-foreground">Modificá los datos y guardá los cambios</p>
      </div>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" onclick={() => printCertificate(avaluoId)} disabled={isLoading}>
        <Printer size={14} /> Imprimir certificado
      </Button>
    </div>
  </div>

  {#if isLoading}
    <Card class="p-10">
      <div class="flex items-center justify-center gap-3 text-muted-foreground">
        <Spinner /> Cargando datos del avalúo…
      </div>
    </Card>
  {:else if loadError}
    <Card class="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
      {loadError}
    </Card>
  {:else}
    <AvaluoForm
      bind:formData
      {validationErrors}
      {isSubmitting}
      isEdit={true}
      onsubmit={handleSubmit}
      oncancel={handleCancel}
    />
  {/if}
</div>
