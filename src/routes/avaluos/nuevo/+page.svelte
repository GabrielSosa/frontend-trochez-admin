<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte';
  import { ApiUrls, apiJson } from '$lib/api.js';
  import { auth } from '$lib/stores/auth.svelte.js';
  import { showError, showSuccess } from '$lib/utils/toast.js';
  import { confirmCancel } from '$lib/utils/confirm.js';
  import { printCertificate } from '$lib/utils/certificate.js';
  import {
    validateAvaluoFormData,
    cleanAvaluoFormData,
    getDefaultAvaluoFormData
  } from '$lib/utils/avaluoUtils.js';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { Printer, ArrowLeft, ChevronLeft } from 'lucide-svelte';

  let isSubmitting = $state(false);
  let validationErrors = $state({});
  let savedAvaluoId = $state(null);

  let formData = $state({
    ...getDefaultAvaluoFormData(),
    appraisal_date: new Date().toISOString().split('T')[0]
  });

  onMount(() => {
    if (!auth.isAuthenticated) {
      goto('/login');
    }
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
        <h1 class="text-2xl font-semibold tracking-tight">Nuevo avalúo</h1>
        <p class="text-sm text-muted-foreground">Registrá un nuevo avalúo vehicular</p>
      </div>
    </div>
  </div>

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
