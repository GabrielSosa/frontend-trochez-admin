<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte'; 
  import { ApiUrls, apiFetch } from '$lib/api';

  // Get the ID from the URL
  let avaluoId = $page.params.id;
  let user = null;
  let isLoading = true;
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';
  let validationErrors = {}; 

  // Initial form data structure (will be populated by fetched data)
  let formData = {
    appraisal_date: '', 
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
    deductions: [] // Ensure it's an array
  };

  onMount(async () => {
    // Get user data
    const userData = localStorage.getItem('userData');
    if (userData) { user = JSON.parse(userData); }

    // Check token
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      errorMessage = 'Sesión no válida. Redirigiendo al login...';
      setTimeout(() => goto('/login'), 2000);
      return;
    }

    // Fetch the existing avalúo data
    try {
      isLoading = true;
      const data = await apiFetch(ApiUrls.AVALUOS.getById(avaluoId));
      console.log('Datos del avalúo cargados:', data);
      
      // Map API data to form data
      formData = {
        // Add this line to map the ID/Number
        appraisal_number: data.id || data.appraisal_number || avaluoId, // Use data.id, data.appraisal_number, or fallback to avaluoId from URL
        appraisal_date: data.appraisal_date?.split('T')[0] || '', 
        vehicle_description: data.vehicle_description || '',
        brand: data.brand || '',
        model_year: data.model_year || new Date().getFullYear(),
        color: data.color || '',
        mileage: data.mileage || 0,
        fuel_type: data.fuel_type || 'Gasolina',
        engine_size: data.engine_size || 0,
        plate_number: data.plate_number || '',
        applicant: data.applicant || '',
        owner: data.owner || '',
        appraisal_value_usd: data.appraisal_value_usd || 0,
        appraisal_value_local: data.appraisal_value_local || 0,
        vin: data.vin || '',
        engine_number: data.engine_number || '',
        notes: data.notes || '',
        validity_days: data.validity_days || 30,
        validity_kms: data.validity_kms || 1000,
        deductions: data.deductions || [] // Ensure it's an array
      };
      
      // successMessage = 'Datos del avalúo cargados.'; 
      // setTimeout(() => successMessage = '', 3000);
    } catch (error) {
      console.error('Error al cargar el avalúo:', error);
      errorMessage = `Error al cargar el avalúo: ${error.message || 'Error desconocido'}`;
       if (error.status === 401) {
          localStorage.removeItem('jwtToken');
          setTimeout(() => goto('/login'), 2000);
          errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
       } else if (error.status === 404) {
           errorMessage = `No se encontró el avalúo con ID ${avaluoId}.`;
           setTimeout(() => goto('/avaluos'), 3000);
       }
    } finally {
      isLoading = false;
    }
  });

  // Handle form submission (triggered by AvaluoForm's submit event)
  async function handleSubmit() {
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';
    validationErrors = {}; 

    try {
       // Basic client-side checks (can be enhanced)
      if (!formData.applicant || !formData.brand || !formData.vehicle_description || !formData.appraisal_value_local) {
         validationErrors = {
           applicant: !formData.applicant ? 'El solicitante es obligatorio.' : '',
           brand: !formData.brand ? 'La marca es obligatoria.' : '',
           vehicle_description: !formData.vehicle_description ? 'La descripción es obligatoria.' : '',
           appraisal_value_local: !formData.appraisal_value_local ? 'El valor local es obligatorio.' : '',
         };
         validationErrors = Object.fromEntries(Object.entries(validationErrors).filter(([_, v]) => v !== ''));
         if (Object.keys(validationErrors).length > 0) {
            throw new Error('Por favor complete los campos obligatorios.');
         }
      }
      
      // More detailed client-side validation
      if (formData.vin && formData.vin.length > 17) {
        validationErrors.vin = 'El VIN no debe exceder 17 caracteres';
      }
      if (formData.engine_number && formData.engine_number.length > 17) {
        validationErrors.engine_number = 'El número de motor no debe exceder 17 caracteres';
      }
       if (formData.appraisal_value_local && formData.appraisal_value_local <= 0) {
         validationErrors.appraisal_value_local = 'El valor local debe ser mayor que cero.';
      }
      
      if (Object.keys(validationErrors).length > 0) {
         throw new Error('Por favor corrija los errores de validación.');
      }

      // Prepare data for API
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
      }

      // Create a cleaned version of the form data for submission
      const cleanedFormData = { ...formData };
      
      // Ensure numeric fields are numbers
      cleanedFormData.model_year = Number(cleanedFormData.model_year) || null;
      cleanedFormData.mileage = Number(cleanedFormData.mileage) || 0;
      cleanedFormData.engine_size = Number(cleanedFormData.engine_size) || null;
      cleanedFormData.appraisal_value_usd = Number(cleanedFormData.appraisal_value_usd) || 0;
      cleanedFormData.appraisal_value_local = Number(cleanedFormData.appraisal_value_local);
      cleanedFormData.validity_days = Number(cleanedFormData.validity_days) || 30;
      cleanedFormData.validity_kms = Number(cleanedFormData.validity_kms) || 1000;
      
      // Ensure deductions array amounts are numbers (if they exist)
      if (cleanedFormData.deductions && Array.isArray(cleanedFormData.deductions)) {
        cleanedFormData.deductions = cleanedFormData.deductions.map(d => ({
          ...d,
          amount: Number(d.amount || 0)
        }));
      }

      console.log('Datos enviados al API (Actualización):', JSON.stringify(cleanedFormData, null, 2));

      try {
        // Send the update request
        await apiFetch(ApiUrls.AVALUOS.update(avaluoId), {
          method: 'PUT',
          body: JSON.stringify(cleanedFormData)
        });
        
        successMessage = 'Avalúo actualizado correctamente.';
        setTimeout(() => {
          goto('/avaluos');
        }, 2000);

      } catch (apiError) {
        console.error('API Error:', apiError);
         if (apiError.status === 401) {
          localStorage.removeItem('jwtToken');
          setTimeout(() => goto('/login'), 2000);
          errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
        } else if (apiError.status === 422 && apiError.data?.detail) {
           errorMessage = 'Error de validación. Por favor revise los campos.';
           validationErrors = {}; 
           apiError.data.detail.forEach(error => {
             const fieldName = error.loc[error.loc.length - 1];
             if (fieldName) {
               validationErrors[fieldName] = error.msg; 
             }
           });
        } else {
          errorMessage = apiError.message || 'Error al comunicarse con el servidor.';
        }
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      if (!errorMessage) { 
          errorMessage = error.message || 'Ha ocurrido un error al actualizar el avalúo.';
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Handle cancel event from AvaluoForm
  function handleCancel() {
    goto('/avaluos');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar {user} />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Editar Avalúo #{avaluoId}</h1>
      <!-- Cancel button is now inside AvaluoForm -->
    </div>

    {#if isLoading}
      <div class="text-center py-10">
        <p class="text-gray-500">Cargando datos del avalúo...</p>
         <!-- Optional: Add a spinner -->
      </div>
    {:else if errorMessage && !isLoading} 
       <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
        <span class="block sm:inline font-medium">Error:</span>
        <span class="block sm:inline">{errorMessage}</span>
         {#if Object.keys(validationErrors).length > 0 && !errorMessage.includes('validación')}
           <ul class="mt-2 list-disc list-inside">
             {#each Object.entries(validationErrors) as [field, message]}
                {#if message}
                 <li><strong>{field}:</strong> {message}</li>
               {/if}
             {/each}
           </ul>
         {/if}
      </div>
    {:else}
      {#if successMessage}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span class="block sm:inline">{successMessage}</span>
        </div>
      {/if}

      <!-- Use the reusable form component -->
      <AvaluoForm 
        bind:formData
        {validationErrors} 
        {isSubmitting}
        on:submit={handleSubmit}
        on:cancel={handleCancel}
      />
    {/if}
  </main>
</div>
