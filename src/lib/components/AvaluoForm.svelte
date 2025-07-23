<script>
  // Props received from parent
  export let formData;
  export let validationErrors = {};
  export let isSubmitting = false;
  export let isEdit = false;

  // Dispatchers for events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Initialize deductions if not present
  if (!formData.deductions) {
    formData.deductions = [];
  }
  // Ensure apprasail_value_bank exists, initialize if not (though ideally done in parent)
  if (formData.apprasail_value_bank === undefined) {
      formData.apprasail_value_bank = 0; 
  }
  // Ensure extras exists, initialize if not
  if (formData.extras === undefined) {
      formData.extras = ''; 
  }
  // Ensure cert exists, initialize if not
  if (formData.cert === undefined) {
      formData.cert = ''; 
  }
  // Ensure bank_value_in_dollars exists, initialize if not
  if (formData.bank_value_in_dollars === undefined) {
      formData.bank_value_in_dollars = 0; 
  }
  // Ensure discounts exists, initialize if not
  if (formData.discounts === undefined) {
      formData.discounts = 0; 
  }

  // State for modal visibility
  let isValueModalOpen = false;

  // Reactive calculation for total deductions
  $: totalDeductions = formData.deductions.reduce((sum, deduction) => {
    const amount = Number(deduction.amount) || 0; 
    return sum + amount;
  }, 0);

  // Reactive calculation for lower cost value
  $: apprasail_value_lower_cost = Math.max(0, (Number(formData.appraisal_value_trochez) || 0) * 0.92 - totalDeductions - (Number(formData.discounts) || 0));

  // Reactive calculation for lower bank value
  $: apprasail_value_lower_bank = Math.max(0, (Number(formData.apprasail_value_bank) || 0) - totalDeductions - (Number(formData.discounts) || 0));

  // Update apprasail_value_lower_cost and apprasail_value_lower_bank before submit
  function triggerSubmit() {
    formData.apprasail_value_lower_cost = apprasail_value_lower_cost; // Assign calculated value back to bound formData
    formData.apprasail_value_lower_bank = apprasail_value_lower_bank; // Assign calculated value back to bound formData
    dispatch('submit'); // Dispatch event AFTER updating formData
  }

  function triggerCancel() {
    dispatch('cancel');
  }

  function addDeduction() {
    if (formData.deductions.length < 9) { // Cambia el límite aquí
      formData.deductions = [...formData.deductions, { description: '', amount: null }];
    }
  }

  function removeDeduction(index) {
    formData.deductions = formData.deductions.filter((_, i) => i !== index);
  }

  function openValueModal() {
    isValueModalOpen = true;
  }

  function closeValueModal() {
    isValueModalOpen = false;
  }

  $: requiredVehicleDescription = !isEdit;
</script>

<form on:submit|preventDefault={triggerSubmit} class="bg-white rounded-lg shadow overflow-hidden">
  <!-- New Header Section based on Image -->
  <div class="p-6 border-b border-gray-200">
    <div class="flex justify-between items-start gap-6 mb-4"> 
      
      <!-- Left Column: Appraisal Number (Static) -->
      <div class="w-1/4"> 
        <label for="appraisal_number" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">No. Avalúo</label>
        <p class="w-full p-1 border-b border-gray-400 text-sm font-semibold"> 
          {formData.appraisal_number || 'N/A'} 
        </p>
      </div>

      <!-- Right Column: Date (Editable), Location (Static), Phone (Static), Number (Static) in a Box -->
      <div class="w-1/3"> 
        <div class="border border-gray-300 rounded-md p-2 space-y-1 text-right"> 
          <div>
            <input
              id="appraisal_date"
              type="date"
              bind:value={formData.appraisal_date}
              required
              class="focus:outline-none text-lg text-right" 
              class:border-red-500={validationErrors?.appraisal_date} 
              class:border-b={!validationErrors?.appraisal_date} 
              class:border-gray-400={!validationErrors?.appraisal_date} 
            />
            {#if validationErrors?.appraisal_date}
              <p class="text-red-500 text-xs mt-1 text-right">{validationErrors.appraisal_date}</p>
            {/if}
          </div>
          <div>
            <label for="location" class="block w-full text-sm text-right uppercase"> 
              SAN JOSE C.R 
            </label>
          </div>
          <div>
            <label for="phone" class="block w-full text-sm text-right">
              Tel. 8794-4104
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Certificate Number Field -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t border-gray-100"> 
      <div>
        <label for="cert" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">No. de Certificado</label>
        <input
          id="cert"
          type="text"
          bind:value={formData.cert}
          placeholder="NÚMERO DE CERTIFICADO"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          spellcheck="false"
        />
      </div>
      <div>
        <label for="validity_days" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Validez (días)</label> 
        <input
          id="validity_days"
          type="number"
          min="1"
          bind:value={formData.validity_days}
          placeholder="DÍAS" 
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" 
        />
      </div>
      <div>
        <label for="validity_kms" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Validez (kilómetros)</label>
        <input
          id="validity_kms"
          type="number"
          min="1"
          bind:value={formData.validity_kms}
          placeholder="KM" 
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm" 
        />
      </div>
    </div>
  </div>
  
  <!-- Información del cliente -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div>
        <label for="applicant" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Solicitante *</label>
        <input
          id="applicant"
          type="text"
          bind:value={formData.applicant}
          required
          placeholder="SOLICITANTE"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          class:border-red-500={validationErrors?.applicant}
          spellcheck="true"
          lang="es"
        />
        {#if validationErrors?.applicant}
          <p class="text-red-500 text-xs mt-1">{validationErrors.applicant}</p>
        {/if}
      </div>
      <div>
        <label for="owner" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Propietario</label>
        <input
          id="owner"
          type="text"
          placeholder="PROPIETARIO"
          bind:value={formData.owner}
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          spellcheck="true"
          lang="es"
        />
      </div>
    </div>
  </div>

  <!-- Información del vehículo -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4 uppercase">Información del Vehículo</h2>
    <div class="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-4">
      <!-- Row 1: Brand, Model/Desc (spans 2 cols), Year, Color -->
      <div class="md:col-span-1">
        <label for="brand" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Marca *</label>
        <input
          id="brand" type="text" bind:value={formData.brand} required placeholder="MARCA"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          class:border-red-500={validationErrors?.brand}
          spellcheck="true"
          lang="es"
        />
        {#if validationErrors?.brand} <p class="text-red-500 text-xs mt-1">{validationErrors.brand}</p> {/if}
      </div>
      <div class="md:col-span-2">
        <label for="vehicle_description" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Descripción/Modelo *</label>
        <input
          id="vehicle_description"
          type="text"
          bind:value={formData.vehicle_description}
          required={requiredVehicleDescription}
          placeholder="MODELO"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          class:border-red-500={validationErrors?.vehicle_description}
          spellcheck="true"
          lang="es"
        />
        {#if validationErrors?.vehicle_description} <p class="text-red-500 text-xs mt-1">{validationErrors.vehicle_description}</p> {/if}
      </div>

      <div class="md:col-span-1"></div> 

      <div class="md:col-span-1">
        <label for="model_year" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Año</label>
        <input
          id="model_year" type="number" min="1900" max={new Date().getFullYear() + 1} bind:value={formData.model_year} placeholder="AÑO"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>
       <div class="md:col-span-1">
        <label for="color" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Color</label>
        <input
          id="color" type="text" bind:value={formData.color} placeholder="COLOR"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          spellcheck="true"
          lang="es"
        />
      </div>

       <div class="md:col-span-1">
        <label for="plate_number" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Placa</label>
        <input
          id="plate_number" type="text" bind:value={formData.plate_number} placeholder="PLACA"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      <div class="md:col-span-1">
        <label for="mileage" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Kilometraje</label>
        <input
          id="mileage" type="number" min="0" bind:value={formData.mileage} placeholder="KM"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>
      <div class="md:col-span-1">
        <label for="fuel_type" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Combustible</label>
        <input
          id="fuel_type" type="text" bind:value={formData.fuel_type} placeholder="COMB."
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          spellcheck="true"
          lang="es"
        />
      </div>

      <!-- Row 3: Engine Size, Extras -->
      <div class="md:col-span-1"> 
        <label for="engine_size" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Cilindraje (cc)</label>
        <input
          id="engine_size" type="number" min="0" step="0.1" bind:value={formData.engine_size} placeholder="CC"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

 
 
      <!-- Updated Extras Field (spans remaining 4 columns) -->
      <div class="md:col-span-4">
        <label for="extras" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Extras</label>
        <input
          id="extras"
          type="text"
          bind:value={formData.extras}
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          placeholder="EXTRAS"
          spellcheck="true"
          autocorrect="on"
          autocomplete="on"
          lang="es"
        />
      </div>
      <!-- Removed the empty placeholder div that was here -->

      <!-- Row 4: Notes (Full Width) -->
      <div class="md:col-span-5">
        <label for="notes" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Observaciones</label>
        <textarea
          id="notes"
          rows="2"
          bind:value={formData.notes}
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          placeholder="OBSERVACIONES..."
          spellcheck="true"
          autocorrect="on"
          autocomplete="on"
          lang="es"
        ></textarea>
      </div>

    </div>
  </div>

  <!-- Verificación de Números -->
  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4 uppercase">Verificación de Números</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div>
        <label for="vin" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">VIN (Físico)</label>
        <input
          id="vin" type="text" maxlength="17" bind:value={formData.vin} placeholder="VIN FÍSICO"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          class:border-red-500={validationErrors?.vin}
        />
        {#if validationErrors?.vin} <p class="text-red-500 text-xs mt-1">{validationErrors.vin}</p> {/if}
      </div>

      <div>
        <label for="vin_card" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Numero de VIN en Tarjeta</label>
        <input
          id="vin_card" type="text" maxlength="17" bind:value={formData.vin_card} placeholder="VIN TARJETA"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          class:border-red-500={validationErrors?.vin_card}
        />
        {#if validationErrors?.vin_card} <p class="text-red-500 text-xs mt-1">{validationErrors.vin_card}</p> {/if}
      </div>

      <div>
        <label for="engine_number" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">No. Motor (Físico)</label>
        <input
          id="engine_number" type="text" maxlength="17" bind:value={formData.engine_number} placeholder="MOTOR FÍSICO #"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          class:border-red-500={validationErrors?.engine_number}
        />
        {#if validationErrors?.engine_number} <p class="text-red-500 text-xs mt-1">{validationErrors.engine_number}</p> {/if}
      </div>

      <div>
        <label for="engine_number_card" class="block text-xs font-medium text-gray-500 uppercase mb-0.5">Numero de Motor en Tarjeta</label>
        <input
          id="engine_number_card" type="text" maxlength="17" bind:value={formData.engine_number_card} placeholder="MOTOR TARJETA #"
          class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          class:border-red-500={validationErrors?.engine_number_card}
        />
        {#if validationErrors?.engine_number_card} <p class="text-red-500 text-xs mt-1">{validationErrors.engine_number_card}</p> {/if}
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
                class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                spellcheck="true"
                lang="es"
              />
              <input
                type="number"
                placeholder="Monto Deducción #{index + 1}"
                min="0"
                step="0.01"
                bind:value={deduction.amount}
                class="w-full p-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <button 
              type="button" 
              on:click={() => removeDeduction(index)}
              class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 ease-in-out"
              aria-label="Eliminar deducción"
            >
              <!-- SVG icon -->
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
            ₡ {totalDeductions.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
          </span>
        </p>
      </div>
    {/if}

    {#if formData.deductions.length < 9} <!-- Cambia el límite aquí -->
      <button 
        type="button" 
        on:click={addDeduction} 
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
      >
        Agregar Deducción
      </button>
    {:else}
       <p class="text-sm text-gray-500 mt-4">Máximo de 9 deducciones alcanzado.</p>
    {/if}
  </div>

  <div class="p-6 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Valor del Avalúo</h2>
    <div class="flex items-center mb-4">
      <button 
        type="button" 
        on:click={openValueModal}
        class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
        title="Establecer Valor Original"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">     
      <!-- Valor Garantía Bancaria -->
      <div>
        <label for="apprasail_value_lower_bank" class="block text-xs font-medium text-gray-700 mb-1">Valor Garantía Bancaria</label>
        <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-yellow-100 text-gray-700 text-lg font-semibold text-center cursor-not-allowed">
          ₡ {apprasail_value_lower_bank.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>
      <!-- Valor Avalúo -->
      <div>
        <label for="apprasail_value_lower_cost" class="block text-xs font-medium text-gray-700 mb-1">Valor Avalúo</label>
        <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-yellow-100 text-gray-700 text-lg font-semibold text-center cursor-not-allowed">
          ₡ {apprasail_value_lower_cost.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        {#if validationErrors?.appraisal_value_trochez}
          <p class="text-red-500 text-xs mt-1">Error en Valor Avaluo Trochez (ver detalles)</p>
        {/if}
      </div>
      <!-- Valor Dólares -->
      <div>
        <label for="appraisal_value_usd" class="block text-xs font-medium text-gray-700 mb-1">Valor (Dólares)</label>
        <input
          id="appraisal_value_usd"
          type="number"
          min="0"
          step="0.01"
          bind:value={formData.appraisal_value_usd}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold text-center"
        />
      </div>
      <!-- Valor Garantía Bancaria en Dólares -->
      <div>
        <label for="bank_value_in_dollars" class="block text-xs font-medium text-gray-700 mb-1">Valor Garantía Bancaria (USD)</label>
        <input
          id="bank_value_in_dollars"
          type="number"
          min="0"
          step="0.01"
          bind:value={formData.bank_value_in_dollars}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold text-center"
          placeholder="0.00"
        />
      </div>
 
    </div>
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

<!-- Value Details Modal -->
{#if isValueModalOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" on:click|self={closeValueModal}>
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-semibold mb-4">Detalles del Valor</h3>
      
      <div class="space-y-4">
        <div>
          <label for="modal_appraisal_value_trochez" class="block text-sm font-medium text-gray-700 mb-1">Valor Avaluo Trochez *</label>
          <input
            id="modal_appraisal_value_trochez"
            type="number"
            min="0.01"
            step="0.01"
            bind:value={formData.appraisal_value_trochez}
            required
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            class:border-red-500={validationErrors?.appraisal_value_trochez}
          />
          {#if validationErrors?.appraisal_value_trochez}
            <p class="text-red-500 text-xs mt-1">{validationErrors.appraisal_value_trochez}</p>
          {/if}
        </div>
        
        <div>
          <label for="modal_apprasail_value_bank" class="block text-sm font-medium text-gray-700 mb-1">Valor Bancario</label>
          <input
            id="modal_apprasail_value_bank"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.apprasail_value_bank}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            class:border-red-500={validationErrors?.apprasail_value_bank} 
          />
           {#if validationErrors?.apprasail_value_bank} /* Add validation if needed */
            <p class="text-red-500 text-xs mt-1">{validationErrors.apprasail_value_bank}</p>
          {/if}
        </div>
        
        <div>
          <label for="modal_discounts" class="block text-sm font-medium text-gray-700 mb-1">Descuento</label>
          <input
            id="modal_discounts"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.discounts}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          {#if validationErrors?.discounts}
            <p class="text-red-500 text-xs mt-1">{validationErrors.discounts}</p>
          {/if}
        </div>
        
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button 
          type="button" 
          on:click={closeValueModal}
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
{/if}
