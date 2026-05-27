<script>
  import Card from '$lib/components/ui/Card.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import SpellInput from '$lib/components/ui/SpellInput.svelte';
  import SpellTextarea from '$lib/components/ui/SpellTextarea.svelte';
  import Label from '$lib/components/ui/Label.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Dialog from '$lib/components/ui/Dialog.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { spell } from '$lib/stores/spell.svelte.js';
  import { onMount } from 'svelte';
  import { Trash2, Plus, Pencil, Save, X, Calculator } from 'lucide-svelte';
  import { formatCRC } from '$lib/utils.js';

  let {
    formData = $bindable(),
    validationErrors = {},
    isSubmitting = false,
    isEdit = false,
    onsubmit,
    oncancel
  } = $props();

  // Make sure required nested defaults exist.
  $effect(() => {
    if (!Array.isArray(formData.deductions)) formData.deductions = [];
    if (formData.apprasail_value_bank === undefined) formData.apprasail_value_bank = 0;
    if (formData.bank_value_in_dollars === undefined) formData.bank_value_in_dollars = 0;
    if (formData.discounts === undefined) formData.discounts = 0;
    if (formData.extras === undefined) formData.extras = '';
    if (formData.cert === undefined) formData.cert = '';
  });

  let valueModalOpen = $state(false);

  let totalDeductions = $derived(
    (formData.deductions ?? []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  );

  let apprasailValueLowerCost = $derived(
    Math.max(
      0,
      (Number(formData.appraisal_value_trochez) || 0) * 0.92 -
        totalDeductions -
        (Number(formData.discounts) || 0)
    )
  );

  let apprasailValueLowerBank = $derived(
    Math.max(
      0,
      (Number(formData.apprasail_value_bank) || 0) -
        totalDeductions -
        (Number(formData.discounts) || 0)
    )
  );

  function handleSubmit(e) {
    e.preventDefault();
    formData.apprasail_value_lower_cost = apprasailValueLowerCost;
    formData.apprasail_value_lower_bank = apprasailValueLowerBank;
    onsubmit?.();
  }

  function addDeduction() {
    if ((formData.deductions ?? []).length >= 9) return;
    formData.deductions = [...(formData.deductions ?? []), { description: '', amount: null }];
  }

  function removeDeduction(index) {
    formData.deductions = formData.deductions.filter((_, i) => i !== index);
  }

  let requiredVehicleDescription = $derived(!isEdit);

  // Load the Spanish dictionary in the background as soon as the form mounts
  // so suggestions are ready by the time the user starts typing.
  onMount(() => {
    spell.init();
  });
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Encabezado / metadatos -->
  <Card>
    <CardContent class="grid grid-cols-1 gap-4 p-6 md:grid-cols-4">
      <div class="space-y-1.5 md:col-span-1">
        <Label for="appraisal_date">Fecha del avalúo</Label>
        <Input
          id="appraisal_date"
          type="date"
          bind:value={formData.appraisal_date}
          error={!!validationErrors?.appraisal_date}
          required
        />
        {#if validationErrors?.appraisal_date}
          <p class="text-xs text-destructive">{validationErrors.appraisal_date}</p>
        {/if}
      </div>
      <div class="space-y-1.5">
        <Label for="cert">No. de certificado</Label>
        <Input
          id="cert"
          type="text"
          bind:value={formData.cert}
          placeholder="Ej. 12345"
          spellcheck="false"
          autocapitalize="off"
        />
      </div>
      <div class="space-y-1.5">
        <Label for="validity_days">Validez (días)</Label>
        <Input id="validity_days" type="number" min="1" bind:value={formData.validity_days} placeholder="30" />
      </div>
      <div class="space-y-1.5">
        <Label for="validity_kms">Validez (km)</Label>
        <Input id="validity_kms" type="number" min="1" bind:value={formData.validity_kms} placeholder="1000" />
      </div>
    </CardContent>
  </Card>

  <!-- Cliente -->
  <Card>
    <CardHeader>
      <CardTitle>Información del cliente</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <Label for="applicant">Solicitante <span class="text-destructive">*</span></Label>
        <SpellInput
          id="applicant"
          bind:value={formData.applicant}
          error={!!validationErrors?.applicant}
          placeholder="Nombre del solicitante"
          required
        />
        {#if validationErrors?.applicant}
          <p class="text-xs text-destructive">{validationErrors.applicant}</p>
        {/if}
      </div>
      <div class="space-y-1.5">
        <Label for="owner">Propietario</Label>
        <SpellInput id="owner" bind:value={formData.owner} placeholder="Propietario" />
      </div>
    </CardContent>
  </Card>

  <!-- Vehículo -->
  <Card>
    <CardHeader>
      <CardTitle>Información del vehículo</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-1 gap-4 md:grid-cols-6">
      <div class="space-y-1.5 md:col-span-2">
        <Label for="brand">Marca <span class="text-destructive">*</span></Label>
        <SpellInput
          id="brand"
          bind:value={formData.brand}
          error={!!validationErrors?.brand}
          placeholder="Toyota"
          required
        />
        {#if validationErrors?.brand}
          <p class="text-xs text-destructive">{validationErrors.brand}</p>
        {/if}
      </div>
      <div class="space-y-1.5 md:col-span-3">
        <Label for="vehicle_description">
          Descripción / modelo {requiredVehicleDescription ? '*' : ''}
        </Label>
        <SpellInput
          id="vehicle_description"
          bind:value={formData.vehicle_description}
          error={!!validationErrors?.vehicle_description}
          placeholder="Hilux 4x4 Cabina Doble"
          required={requiredVehicleDescription}
        />
        {#if validationErrors?.vehicle_description}
          <p class="text-xs text-destructive">{validationErrors.vehicle_description}</p>
        {/if}
      </div>
      <div class="space-y-1.5">
        <Label for="model_year">Año</Label>
        <Input
          id="model_year"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1}
          bind:value={formData.model_year}
        />
      </div>
      <div class="space-y-1.5">
        <Label for="color">Color</Label>
        <SpellInput id="color" bind:value={formData.color} placeholder="Negro" />
      </div>
      <div class="space-y-1.5">
        <Label for="plate_number">Placa</Label>
        <Input
          id="plate_number"
          type="text"
          bind:value={formData.plate_number}
          placeholder="ABC123"
          spellcheck="false"
          autocapitalize="characters"
          class="uppercase"
        />
      </div>
      <div class="space-y-1.5">
        <Label for="mileage">Kilometraje</Label>
        <Input id="mileage" type="number" min="0" bind:value={formData.mileage} placeholder="100000" />
      </div>
      <div class="space-y-1.5">
        <Label for="fuel_type">Combustible</Label>
        <SpellInput id="fuel_type" bind:value={formData.fuel_type} placeholder="Diesel" />
      </div>
      <div class="space-y-1.5">
        <Label for="engine_size">Cilindraje</Label>
        <Input
          id="engine_size"
          type="number"
          min="0"
          step="0.1"
          bind:value={formData.engine_size}
          placeholder="2.5"
        />
      </div>
      <div class="space-y-1.5 md:col-span-6">
        <Label for="extras">Extras</Label>
        <SpellInput id="extras" bind:value={formData.extras} placeholder="Equipamiento adicional" />
      </div>
      <div class="space-y-1.5 md:col-span-6">
        <Label for="notes">Observaciones</Label>
        <SpellTextarea id="notes" bind:value={formData.notes} placeholder="Notas sobre el vehículo…" rows="3" />
      </div>
    </CardContent>
  </Card>

  <!-- Verificación de números -->
  <Card>
    <CardHeader>
      <CardTitle>Verificación de números</CardTitle>
      <p class="text-sm text-muted-foreground">VIN y número de motor: máximo 17 caracteres</p>
    </CardHeader>
    <CardContent class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <Label for="vin">VIN (físico)</Label>
        <Input
          id="vin"
          type="text"
          maxlength="17"
          bind:value={formData.vin}
          error={!!validationErrors?.vin}
          spellcheck="false"
          autocapitalize="characters"
          autocomplete="off"
          class="uppercase tracking-wider"
        />
        {#if validationErrors?.vin}
          <p class="text-xs text-destructive">{validationErrors.vin}</p>
        {/if}
      </div>
      <div class="space-y-1.5">
        <Label for="vin_card">VIN en tarjeta</Label>
        <Input
          id="vin_card"
          type="text"
          maxlength="17"
          bind:value={formData.vin_card}
          error={!!validationErrors?.vin_card}
          spellcheck="false"
          autocapitalize="characters"
          autocomplete="off"
          class="uppercase tracking-wider"
        />
        {#if validationErrors?.vin_card}
          <p class="text-xs text-destructive">{validationErrors.vin_card}</p>
        {/if}
      </div>
      <div class="space-y-1.5">
        <Label for="engine_number">No. motor (físico)</Label>
        <Input
          id="engine_number"
          type="text"
          maxlength="17"
          bind:value={formData.engine_number}
          error={!!validationErrors?.engine_number}
          spellcheck="false"
          autocapitalize="characters"
          autocomplete="off"
          class="uppercase tracking-wider"
        />
        {#if validationErrors?.engine_number}
          <p class="text-xs text-destructive">{validationErrors.engine_number}</p>
        {/if}
      </div>
      <div class="space-y-1.5">
        <Label for="engine_number_card">No. motor en tarjeta</Label>
        <Input
          id="engine_number_card"
          type="text"
          maxlength="17"
          bind:value={formData.engine_number_card}
          error={!!validationErrors?.engine_number_card}
          spellcheck="false"
          autocapitalize="characters"
          autocomplete="off"
          class="uppercase tracking-wider"
        />
        {#if validationErrors?.engine_number_card}
          <p class="text-xs text-destructive">{validationErrors.engine_number_card}</p>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Deducciones -->
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Deducciones</CardTitle>
        <p class="text-sm text-muted-foreground">Hasta 9 deducciones</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-muted-foreground">Total</p>
        <p class="text-lg font-semibold tabular-nums text-destructive">{formatCRC(totalDeductions)}</p>
      </div>
    </CardHeader>
    <CardContent>
      {#if (formData.deductions ?? []).length === 0}
        <p class="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          Sin deducciones agregadas
        </p>
      {:else}
        <div class="space-y-3">
          {#each formData.deductions as deduction, index (index)}
            <div class="flex items-center gap-2">
              <div class="grid flex-1 grid-cols-1 gap-2 md:grid-cols-[1fr_180px]">
                <SpellInput
                  bind:value={deduction.description}
                  placeholder="Descripción de la deducción #{index + 1}"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  bind:value={deduction.amount}
                  placeholder="Monto"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onclick={() => removeDeduction(index)}
                aria-label="Eliminar deducción"
                class="text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          {/each}
        </div>
      {/if}

      {#if (formData.deductions ?? []).length < 9}
        <Button type="button" variant="outline" size="sm" onclick={addDeduction} class="mt-4">
          <Plus size={14} /> Agregar deducción
        </Button>
      {:else}
        <p class="mt-3 text-xs text-muted-foreground">Máximo de 9 deducciones alcanzado.</p>
      {/if}
    </CardContent>
  </Card>

  <!-- Valores -->
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Valor del avalúo</CardTitle>
        <p class="text-sm text-muted-foreground">Valores calculados y de referencia</p>
      </div>
      <Button type="button" variant="outline" size="sm" onclick={() => (valueModalOpen = true)}>
        <Calculator size={14} /> Ajustar valores
      </Button>
    </CardHeader>
    <CardContent class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-lg border bg-amber-50 p-4">
        <p class="text-xs font-medium uppercase text-amber-700">Garantía bancaria</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-amber-900">
          {formatCRC(apprasailValueLowerBank)}
        </p>
      </div>
      <div class="rounded-lg border bg-amber-50 p-4">
        <p class="text-xs font-medium uppercase text-amber-700">Valor avalúo</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-amber-900">
          {formatCRC(apprasailValueLowerCost)}
        </p>
        {#if validationErrors?.appraisal_value_trochez}
          <p class="mt-1 text-xs text-destructive">Revisá el valor Trochez</p>
        {/if}
      </div>
      <div class="space-y-1.5">
        <Label for="appraisal_value_usd">Valor (USD)</Label>
        <Input
          id="appraisal_value_usd"
          type="number"
          min="0"
          step="0.01"
          bind:value={formData.appraisal_value_usd}
          class="text-center text-lg font-semibold"
        />
      </div>
      <div class="space-y-1.5">
        <Label for="bank_value_in_dollars">Garantía bancaria (USD)</Label>
        <Input
          id="bank_value_in_dollars"
          type="number"
          min="0"
          step="0.01"
          bind:value={formData.bank_value_in_dollars}
          placeholder="0.00"
          class="text-center text-lg font-semibold"
        />
      </div>
    </CardContent>
  </Card>

  <!-- Acciones -->
  <div class="flex flex-col-reverse justify-end gap-2 md:flex-row">
    <Button type="button" variant="outline" onclick={oncancel} disabled={isSubmitting}>
      Cancelar
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {#if isSubmitting}
        <Spinner size={14} /> Guardando…
      {:else}
        <Save size={16} /> {isEdit ? 'Guardar cambios' : 'Guardar avalúo'}
      {/if}
    </Button>
  </div>
</form>

<!-- Modal de detalles del valor -->
<Dialog bind:open={valueModalOpen} title="Detalles del valor" description="Valores base utilizados para los cálculos">
  <div class="space-y-4">
    <div class="space-y-1.5">
      <Label for="modal_appraisal_value_trochez">Valor Trochez <span class="text-destructive">*</span></Label>
      <Input
        id="modal_appraisal_value_trochez"
        type="number"
        min="0.01"
        step="0.01"
        bind:value={formData.appraisal_value_trochez}
        error={!!validationErrors?.appraisal_value_trochez}
        required
      />
      {#if validationErrors?.appraisal_value_trochez}
        <p class="text-xs text-destructive">{validationErrors.appraisal_value_trochez}</p>
      {/if}
    </div>
    <div class="space-y-1.5">
      <Label for="modal_apprasail_value_bank">Valor bancario</Label>
      <Input
        id="modal_apprasail_value_bank"
        type="number"
        min="0"
        step="0.01"
        bind:value={formData.apprasail_value_bank}
      />
    </div>
    <div class="space-y-1.5">
      <Label for="modal_discounts">Descuento</Label>
      <Input
        id="modal_discounts"
        type="number"
        min="0"
        step="0.01"
        bind:value={formData.discounts}
        placeholder="0.00"
      />
    </div>
  </div>
  <div class="mt-6 flex justify-end gap-2">
    <Button variant="outline" onclick={() => (valueModalOpen = false)}>Cerrar</Button>
  </div>
</Dialog>
