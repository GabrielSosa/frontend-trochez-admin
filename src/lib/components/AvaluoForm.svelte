<script>
  // Props received from parent
  export let formData;
  export let validationErrors = {};
  export let isSubmitting = false;

  // Dispatchers for events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Initialize deductions if not present
  if (!formData.deductions) {
    formData.deductions = [];
  }

  // Reactive calculation for total deductions
  $: totalDeductions = formData.deductions.reduce((sum, deduction) => {
    // Ensure amount is treated as a number, default to 0 if null, undefined or not a number
    const amount = Number(deduction.amount) || 0; 
    return sum + amount;
  }, 0);

  function triggerSubmit() {
    dispatch('submit');
  }

  function triggerCancel() {
    dispatch('cancel');
  }

  function addDeduction() {
    if (formData.deductions.length < 5) {
      formData.deductions = [...formData.deductions, { description: '', amount: null }];
    }
  }

  function removeDeduction(index) {
    formData.deductions = formData.deductions.filter((_, i) => i !== index);
  }
</script>

<form on:submit|preventDefault={triggerSubmit} class="bg-white rounded-lg shadow overflow-hidden">
  <!-- Fecha del Avalúo -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Fecha del Avalúo</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label for="appraisal_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
        <input
          id="appraisal_date"
          type="date"
          bind:value={formData.appraisal_date}
          required
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.appraisal_date}
        />
        {#if validationErrors?.appraisal_date}
          <p class="text-red-500 text-xs mt-1">{validationErrors.appraisal_date}</p>
        {/if}
      </div>
      <div>
        <label for="validity_days" class="block text-sm font-medium text-gray-700 mb-1">Validez (días)</label>
        <input
          id="validity_days"
          type="number"
          min="1"
          bind:value={formData.validity_days}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="validity_kms" class="block text-sm font-medium text-gray-700 mb-1">Validez (kilómetros)</label>
        <input
          id="validity_kms"
          type="number"
          min="1"
          bind:value={formData.validity_kms}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
  
  <!-- Información del cliente -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="applicant" class="block text-sm font-medium text-gray-700 mb-1">Solicitante *</label>
        <input
          id="applicant"
          type="text"
          bind:value={formData.applicant}
          required
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.applicant}
        />
        {#if validationErrors?.applicant}
          <p class="text-red-500 text-xs mt-1">{validationErrors.applicant}</p>
        {/if}
      </div>
      <div>
        <label for="owner" class="block text-sm font-medium text-gray-700 mb-1">Propietario</label>
        <input
          id="owner"
          type="text"
          bind:value={formData.owner}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>

  <!-- Información del vehículo -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Información del Vehículo</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label for="brand" class="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
        <input
          id="brand"
          type="text"
          bind:value={formData.brand}
          required
          placeholder="Ej: Toyota, Honda..."
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.brand}
        />
        {#if validationErrors?.brand}
          <p class="text-red-500 text-xs mt-1">{validationErrors.brand}</p>
        {/if}
      </div>
      <div>
        <label for="vehicle_description" class="block text-sm font-medium text-gray-700 mb-1">Descripción/Modelo *</label>
        <input
          id="vehicle_description"
          type="text"
          bind:value={formData.vehicle_description}
          required
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.vehicle_description}
        />
        {#if validationErrors?.vehicle_description}
          <p class="text-red-500 text-xs mt-1">{validationErrors.vehicle_description}</p>
        {/if}
      </div>
      <div>
        <label for="model_year" class="block text-sm font-medium text-gray-700 mb-1">Año</label>
        <input
          id="model_year"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1}
          bind:value={formData.model_year}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="color" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <input
          id="color"
          type="text"
          bind:value={formData.color}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="plate_number" class="block text-sm font-medium text-gray-700 mb-1">Placa</label>
        <input
          id="plate_number"
          type="text"
          bind:value={formData.plate_number}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
       <div>
        <label for="vin" class="block text-sm font-medium text-gray-700 mb-1">VIN</label>
        <input
          id="vin"
          type="text"
          maxlength="20"
          bind:value={formData.vin}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.vin}
        />
        {#if validationErrors?.vin}
          <p class="text-red-500 text-xs mt-1">{validationErrors.vin}</p>
        {/if}
      </div>
       <div>
        <label for="engine_number" class="block text-sm font-medium text-gray-700 mb-1">No. Motor</label>
        <input
          id="engine_number"
          type="text"
          maxlength="20"
          bind:value={formData.engine_number}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.engine_number}
        />
        {#if validationErrors?.engine_number}
          <p class="text-red-500 text-xs mt-1">{validationErrors.engine_number}</p>
        {/if}
      </div>
      <div>
        <label for="mileage" class="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
        <input
          id="mileage"
          type="number"
          min="0"
          bind:value={formData.mileage}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="fuel_type" class="block text-sm font-medium text-gray-700 mb-1">Tipo Combustible</label>
        <input
          id="fuel_type"
          type="text"
          bind:value={formData.fuel_type}
          placeholder="Ej: Gasolina, Diesel..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="engine_size" class="block text-sm font-medium text-gray-700 mb-1">Tamaño Motor (cc)</label>
        <input
          id="engine_size"
          type="number"
          min="0"
          step="0.1"
          bind:value={formData.engine_size}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>

  <!-- Deducciones -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Deducciones</h2>
    {#if formData.deductions.length > 0}
      <div class="space-y-4 mb-4">
        {#each formData.deductions as deduction, index (index)}
          <div class="flex items-center space-x-3">
            <div class="flex-grow grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Descripción Deducción #{index + 1}"
                bind:value={deduction.description}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Monto Deducción #{index + 1}"
                min="0" 
                step="0.01"
                bind:value={deduction.amount}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              type="button" 
              on:click={() => removeDeduction(index)}
              class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 ease-in-out"
              aria-label="Eliminar deducción"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        {/each}
      </div>

      <!-- Display Total Deductions -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <p class="text-md font-semibold text-gray-700 text-right">
          Total Deducciones: 
          <span class="text-red-600">
            Lps. {totalDeductions.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
      </div>
    {/if}

    {#if formData.deductions.length < 5}
      <button 
        type="button" 
        on:click={addDeduction} 
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
      >
        Agregar Deducción
      </button>
    {:else}
       <p class="text-sm text-gray-500 mt-4">Máximo de 5 deducciones alcanzado.</p>
    {/if}
  </div>

  <!-- Valor del Avalúo -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Valor del Avalúo</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="appraisal_value_local" class="block text-sm font-medium text-gray-700 mb-1">Valor (Lempiras) *</label>
        <input
          id="appraisal_value_local"
          type="number"
          min="0.01"
          step="0.01"
          bind:value={formData.appraisal_value_local}
          required
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.appraisal_value_local}
        />
         {#if validationErrors?.appraisal_value_local}
          <p class="text-red-500 text-xs mt-1">{validationErrors.appraisal_value_local}</p>
        {/if}
      </div>
      <div>
        <label for="appraisal_value_usd" class="block text-sm font-medium text-gray-700 mb-1">Valor (Dólares)</label>
        <input
          id="appraisal_value_usd"
          type="number"
          min="0"
          step="0.01"
          bind:value={formData.appraisal_value_usd}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>

  <!-- Notas -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Notas Adicionales</h2>
    <textarea
      id="notes"
      rows="4"
      bind:value={formData.notes}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Añade cualquier observación relevante aquí..."
    ></textarea>
  </div>

  <!-- Botones de Acción -->
  <div class="p-6 bg-gray-50 flex justify-end items-center space-x-4">
    <button 
      type="button" 
      on:click={triggerCancel}
      class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      disabled={isSubmitting}
    >
      Cancelar
    </button>
    <button 
      type="submit"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isSubmitting}
    >
      {#if isSubmitting}
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Guardando...
      {:else}
        Guardar Avalúo
      {/if}
    </button>
  </div>
</form>
