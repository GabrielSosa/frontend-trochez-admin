<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte'; 
  import { ApiUrls, apiFetch } from '$lib/api';
  // Import the utility functions
  import { validateAvaluoFormData, cleanAvaluoFormData, getDefaultAvaluoFormData } from '$lib/utils/avaluoUtils.js';

  let user = null;
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';
  let validationErrors = {}; 

  // Use the default structure and override the date
  let formData = getDefaultAvaluoFormData();
  formData.appraisal_date = new Date().toISOString().split('T')[0]; // Set default date for new appraisals

  onMount(async () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    const token = localStorage.getItem('jwtToken');
    if (token) {
      console.log('Token value:', token.substring(0, 20) + '...');
    } else {
      console.warn('No se encontró token JWT en localStorage');
      errorMessage = 'Sesión no válida. Por favor inicie sesión nuevamente.';
      setTimeout(() => goto('/login'), 2000);
    }
  });

  async function handleSubmit() {
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';
    validationErrors = {}; // Reset errors

    try {
      // --- Use Shared Validation ---
      validationErrors = validateAvaluoFormData(formData); 
      
      if (Object.keys(validationErrors).length > 0) {
         // Filter out empty messages just in case (though validateAvaluoFormData shouldn't produce them)
         validationErrors = Object.fromEntries(Object.entries(validationErrors).filter(([_, v]) => v));
         if (Object.keys(validationErrors).length > 0) {
            throw new Error('Por favor corrija los errores de validación.');
         }
      }
      // --- End Shared Validation ---


      // Prepare data for API
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
      }

      // --- Use Shared Cleaning ---
      const cleanedFormData = cleanAvaluoFormData(formData);
      // --- End Shared Cleaning ---

      console.log('Datos enviados al API (Nuevo):', JSON.stringify(cleanedFormData, null, 2));

      try {
        const response = await apiFetch(ApiUrls.AVALUOS.create, {
          method: 'POST',
          body: JSON.stringify(cleanedFormData)
        });
        
        successMessage = 'Avalúo guardado correctamente.';
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
           // Handle backend validation errors (these might differ from frontend checks)
           errorMessage = 'Error de validación del servidor. Por favor revise los campos.';
           validationErrors = {}; // Reset frontend errors, show backend ones
           apiError.data.detail.forEach(error => {
             const fieldName = error.loc[error.loc.length - 1]; 
             if (fieldName) {
               // Prioritize backend error messages if available for a field
               validationErrors[fieldName] = error.msg; 
             }
           });
        } else {
          errorMessage = apiError.message || 'Error al comunicarse con el servidor.';
        }
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      if (!errorMessage) { // Only set generic message if no specific API or validation error was set
         errorMessage = error.message || 'Ha ocurrido un error al guardar el avalúo.';
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    goto('/avaluos');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar {user} />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Nuevo Avalúo</h1>
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
    {/if}

    <AvaluoForm 
      bind:formData
      {validationErrors} 
      {isSubmitting}
      on:submit={handleSubmit}
      on:cancel={handleCancel}
    />

  </main>
</div>
