<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte'; 
  import { ApiUrls, apiFetch } from '$lib/api';

  let user = null;
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';
  let validationErrors = {}; 

  let formData = {
    appraisal_date: new Date().toISOString().split('T')[0], 
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
    deduction_description: '', 
    deduction_amount: 0,
    deductions: [] 
  };

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
    console.log('Token en nuevo avalúo page:', token ? 'Existe' : 'No existe');
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
    validationErrors = {}; 

    try {
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
      
      if (formData.vin && formData.vin.length > 20) {
        validationErrors.vin = 'El VIN no debe exceder 20 caracteres';
      }
      if (formData.engine_number && formData.engine_number.length > 20) {
        validationErrors.engine_number = 'El número de motor no debe exceder 20 caracteres';
      }
      if (formData.appraisal_value_local && formData.appraisal_value_local <= 0) {
         validationErrors.appraisal_value_local = 'El valor local debe ser mayor que cero.';
      }
      
      if (Object.keys(validationErrors).length > 0) {
         throw new Error('Por favor corrija los errores de validación.');
      }

      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
      }

      const cleanedFormData = { ...formData };
      cleanedFormData.model_year = Number(cleanedFormData.model_year) || null;
      cleanedFormData.mileage = Number(cleanedFormData.mileage) || 0;
      cleanedFormData.engine_size = Number(cleanedFormData.engine_size) || null;
      cleanedFormData.appraisal_value_usd = Number(cleanedFormData.appraisal_value_usd) || 0;
      cleanedFormData.appraisal_value_local = Number(cleanedFormData.appraisal_value_local);
      cleanedFormData.validity_days = Number(cleanedFormData.validity_days) || 30;
      cleanedFormData.validity_kms = Number(cleanedFormData.validity_kms) || 1000;

      if (cleanedFormData.deduction_description || cleanedFormData.deduction_amount) {
        cleanedFormData.deductions = [
          {
            description: cleanedFormData.deduction_description || '',
            amount: Number(cleanedFormData.deduction_amount || 0)
          }
        ];
      } else {
        cleanedFormData.deductions = [];
      }
      delete cleanedFormData.deduction_description;
      delete cleanedFormData.deduction_amount;

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
