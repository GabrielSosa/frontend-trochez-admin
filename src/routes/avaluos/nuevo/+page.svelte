<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import { ApiUrls, apiFetch } from '$lib/api';

  let user = null;
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';
  let validationErrors = {}; // Object to store field-specific validation errors

  // Form data based on the JSON structure
  let formData = {
    appraisal_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    vehicle_description: '',
    brand: '',
    model_year: new Date().getFullYear(),
    color: '',
    mileage: 0,
    fuel_type: 'Gasolina',
    engine_size: 0,
    plate_number: '',
    applicant: '',
    owner: '',
    appraisal_value_usd: 0,
    appraisal_value_local: 0,
    vin: '',
    engine_number: '',
    notes: '',
    validity_days: 30,
    validity_kms: 1000,
    deductions: [] // Changed to array based on API error
  };

  // Options for selects
  const fuelTypes = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico', 'Gas'];
  const marcasVehiculos = [
    'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 
    'Mitsubishi', 'Ford', 'Chevrolet', 'Mazda', 'Suzuki',
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Lexus',
    'Jeep', 'Land Rover', 'Subaru', 'Volvo', 'Porsche'
  ];

  onMount(async () => {
    // Get user data from localStorage if available
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // Check if token exists
    const token = localStorage.getItem('jwtToken');
    console.log('Token en nuevo avalúo page:', token ? 'Existe' : 'No existe');
    if (token) {
      console.log('Token value:', token.substring(0, 20) + '...');
    } else {
      console.warn('No se encontró token JWT en localStorage');
      // Redirect to login if no token is found
      errorMessage = 'Sesión no válida. Por favor inicie sesión nuevamente.';
      setTimeout(() => goto('/login'), 2000);
    }
  });

  // Handle form submission
  async function handleSubmit() {
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';

    try {
      // Validate form
      if (!formData.applicant || !formData.brand || !formData.vehicle_description || !formData.appraisal_value_local) {
        throw new Error('Por favor complete los campos obligatorios.');
      }

      // Submit to API
      try {
        // Get JWT token
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          throw new Error('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
        }
        
        // Log the data being sent to the API
        const jsonData = JSON.stringify(formData, null, 2);
        console.log('Datos enviados al API:', jsonData);
        
        // Display the JSON data in the console in a more readable format
        console.table(formData);
        
        // Reset validation errors
        validationErrors = {};
        
        // Add pre-request validation
        if (!formData.appraisal_date) {
          throw new Error('La fecha del avalúo es obligatoria');
        }
        
        if (!formData.vehicle_description) {
          throw new Error('La descripción del vehículo es obligatoria');
        }
        
        if (!formData.brand) {
          throw new Error('La marca del vehículo es obligatoria');
        }
        
        if (!formData.applicant) {
          throw new Error('El nombre del solicitante es obligatorio');
        }
        
        if (!formData.appraisal_value_local || formData.appraisal_value_local <= 0) {
          throw new Error('El valor del avalúo en moneda local debe ser mayor que cero');
        }
        
        // Client-side validation for field lengths
        if (formData.vin && formData.vin.length > 20) {
          validationErrors.vin = 'El VIN no debe exceder 20 caracteres';
        }
        
        if (formData.engine_number && formData.engine_number.length > 20) {
          validationErrors.engine_number = 'El número de motor no debe exceder 20 caracteres';
        }
        
        // Check if there are any validation errors
        if (Object.keys(validationErrors).length > 0) {
          throw new Error('Por favor corrija los errores de validación');
        }
        
        // Create a copy of the data and ensure all number fields are actually numbers
        const cleanedFormData = { ...formData };
        cleanedFormData.model_year = Number(cleanedFormData.model_year);
        cleanedFormData.mileage = Number(cleanedFormData.mileage);
        cleanedFormData.engine_size = Number(cleanedFormData.engine_size);
        cleanedFormData.appraisal_value_usd = Number(cleanedFormData.appraisal_value_usd);
        cleanedFormData.appraisal_value_local = Number(cleanedFormData.appraisal_value_local);
        cleanedFormData.validity_days = Number(cleanedFormData.validity_days);
        cleanedFormData.validity_kms = Number(cleanedFormData.validity_kms);
        
        // Convert deductions to array format as required by the API
        if (formData.deduction_description || formData.deduction_amount) {
          cleanedFormData.deductions = [
            {
              description: formData.deduction_description || '',
              amount: Number(formData.deduction_amount || 0)
            }
          ];
        } else {
          cleanedFormData.deductions = [];
        }
        
        // Log the cleaned data
        console.log('Datos limpiados:', JSON.stringify(cleanedFormData, null, 2));
        
        const response = await apiFetch(ApiUrls.AVALUOS.create, {
          method: 'POST',
          body: JSON.stringify(cleanedFormData)
        });
        
        // Show success message
        successMessage = 'Avalúo guardado correctamente.';
        
        // Reset form after 2 seconds and redirect
        setTimeout(() => {
          goto('/avaluos');
        }, 2000);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Log more details about the error
        if (apiError.status) {
          console.error(`Status code: ${apiError.status}`);
        }
        
        if (apiError.data) {
          console.error('Error data:', apiError.data);
        }
        
        if (apiError.status === 401) {
          // Handle authentication error
          localStorage.removeItem('jwtToken'); // Clear invalid token
          setTimeout(() => goto('/login'), 2000);
          throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
        } else if (apiError.status === 422) {
          // Handle validation errors
          let errorMsg = 'Error de validación en los datos';
          validationErrors = {}; // Reset validation errors
          
          if (apiError.data && apiError.data.detail) {
            const details = apiError.data.detail;
            console.log('Validation details:', details);
            
            // Process each validation error
            if (Array.isArray(details)) {
              details.forEach(error => {
                // Get the field name from the location path
                const fieldPath = error.loc;
                let fieldName = '';
                
                if (fieldPath && fieldPath.length > 1) {
                  fieldName = fieldPath[fieldPath.length - 1]; // Get the last item in the path
                }
                
                if (fieldName) {
                  // Store the error message for this field
                  validationErrors[fieldName] = error.msg;
                  
                  // Special handling for deductions
                  if (fieldName === 'deductions' && error.type === 'list_type') {
                    validationErrors.deductions = 'Las deducciones deben ser una lista';
                  }
                }
              });
              
              // Create a summary of all validation errors
              const errorDetails = Object.entries(validationErrors)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join('; ');
              
              if (errorDetails) {
                errorMsg += ': ' + errorDetails;
              }
            }
          } else if (apiError.message) {
            errorMsg += ': ' + apiError.message;
          }
          
          throw new Error(errorMsg);
        } else {
          throw new Error(apiError.message || 'Error al comunicarse con el servidor');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      errorMessage = error.message || 'Ha ocurrido un error al guardar el avalúo.';
    } finally {
      isSubmitting = false;
    }
  }

  // Cancel and go back
  function handleCancel() {
    goto('/avaluos');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar {user} />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Nuevo Avalúo</h1>
      <button 
        on:click={handleCancel}
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Cancelar
      </button>
    </div>

    {#if successMessage}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
        <span class="block sm:inline">{successMessage}</span>
      </div>
    {/if}

    {#if errorMessage}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
        <span class="block sm:inline font-medium">Error:</span>
        <span class="block sm:inline">{errorMessage}</span>
        
        {#if Object.keys(validationErrors).length > 0}
          <ul class="mt-2 list-disc list-inside">
            {#each Object.entries(validationErrors) as [field, message]}
              <li><strong>{field}:</strong> {message}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow overflow-hidden">
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione una marca</option>
              {#each marcasVehiculos as marca}
                <option value={marca}>{marca}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="vehicle_description" class="block text-sm font-medium text-gray-700 mb-1">Descripción/Modelo *</label>
            <input
              id="vehicle_description"
              type="text"
              bind:value={formData.vehicle_description}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            <label for="fuel_type" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Combustible</label>
            <select
              id="fuel_type"
              bind:value={formData.fuel_type}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {#each fuelTypes as fuelType}
                <option value={fuelType}>{fuelType}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="engine_size" class="block text-sm font-medium text-gray-700 mb-1">Tamaño de Motor</label>
            <input
              id="engine_size"
              type="number"
              step="0.1"
              min="0"
              bind:value={formData.engine_size}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="vin" class="block text-sm font-medium text-gray-700 mb-1">VIN</label>
            {#if validationErrors.vin}
              <div class="text-sm text-red-600 mb-1">{validationErrors.vin}</div>
            {/if}
            <input
              id="vin"
              type="text"
              maxlength="20"
              bind:value={formData.vin}
              class="w-full px-3 py-2 border {validationErrors.vin ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div class="text-xs text-gray-500 mt-1">Máximo 20 caracteres</div>
          </div>
          <div>
            <label for="engine_number" class="block text-sm font-medium text-gray-700 mb-1">Número de Motor</label>
            {#if validationErrors.engine_number}
              <div class="text-sm text-red-600 mb-1">{validationErrors.engine_number}</div>
            {/if}
            <input
              id="engine_number"
              type="text"
              maxlength="20"
              bind:value={formData.engine_number}
              class="w-full px-3 py-2 border {validationErrors.engine_number ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div class="text-xs text-gray-500 mt-1">Máximo 20 caracteres</div>
          </div>
        </div>
      </div>

      <!-- Deducción -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Deducción</h2>
        {#if validationErrors.deductions}
          <div class="mb-4 text-sm text-red-600">{validationErrors.deductions}</div>
        {/if}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="deduction_description" class="block text-sm font-medium text-gray-700 mb-1">Descripción de la Deducción</label>
            <input
              id="deduction_description"
              type="text"
              bind:value={formData.deduction_description}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Rayones en puerta, daños en parachoques..."
            />
          </div>
          <div>
            <label for="deduction_amount" class="block text-sm font-medium text-gray-700 mb-1">Monto de la Deducción (USD)</label>
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

      <!-- Valoración -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Valoración</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="appraisal_value_usd" class="block text-sm font-medium text-gray-700 mb-1">Valor del Avalúo (USD)</label>
            <input
              id="appraisal_value_usd"
              type="number"
              min="0"
              step="0.01"
              bind:value={formData.appraisal_value_usd}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="appraisal_value_local" class="block text-sm font-medium text-gray-700 mb-1">Valor del Avalúo (HNL) *</label>
            <input
              id="appraisal_value_local"
              type="number"
              min="0"
              step="1000"
              bind:value={formData.appraisal_value_local}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>



      <!-- Notas -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Notas</h2>
        <div>
          <textarea
            id="notes"
            bind:value={formData.notes}
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese cualquier observación relevante sobre el vehículo o el avalúo..."
          ></textarea>
        </div>
      </div>

      <!-- Submit button -->
      <div class="p-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Avalúo'}
        </button>
      </div>
    </form>
  </main>
</div>
