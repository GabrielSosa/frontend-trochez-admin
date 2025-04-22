<script>
  // Props received from parent
  export let formData;
  export let validationErrors = {};
  export let isSubmitting = false;

  // Dispatchers for events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Static options (could also be passed as props if needed)
  const fuelTypes = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico', 'Gas'];
  const marcasVehiculos = [
    'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 
    'Mitsubishi', 'Ford', 'Chevrolet', 'Mazda', 'Suzuki',
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Lexus',
    'Jeep', 'Land Rover', 'Subaru', 'Volvo', 'Porsche'
  ];

  function triggerSubmit() {
    dispatch('submit');
  }

  function triggerCancel() {
    dispatch('cancel');
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
        <select
          id="brand"
          bind:value={formData.brand}
          required
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          class:border-red-500={validationErrors?.brand}
        >
          <option value="">Seleccione una marca</option>
          {#each marcasVehiculos as marca}
            <option value={marca}>{marca}</option>
          {/each}
        </select>
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
        <select
          id="fuel_type"
          bind:value={formData.fuel_type}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {#each fuelTypes as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
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

  <!-- Deducciones -->
  <div class="p-6 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Deducciones</h2>
      {#if validationErrors?.deductions}
          <p class="text-red-500 text-xs mb-2">{validationErrors.deductions}</p>
      {/if}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label for="deduction_description" class="block text-sm font-medium text-gray-700 mb-1">Descripción Deducción</label>
              <input
                  id="deduction_description"
                  type="text"
                  bind:value={formData.deduction_description}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
          <div>
              <label for="deduction_amount" class="block text-sm font-medium text-gray-700 mb-1">Monto Deducción (Lempiras)</label>
              <input
                  id="deduction_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  bind:value={formData.deduction_amount}
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
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
