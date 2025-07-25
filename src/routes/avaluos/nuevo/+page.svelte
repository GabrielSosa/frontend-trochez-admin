<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte'; 
  import { ApiUrls, apiFetch } from '$lib/api';
  import { showSuccess, showError, showInfo } from '$lib/utils/toast.js';
  import { confirmCancel } from '$lib/utils/confirm.js';
  // Import the utility functions
  import { validateAvaluoFormData, cleanAvaluoFormData, getDefaultAvaluoFormData } from '$lib/utils/avaluoUtils.js';

  let user = null;
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';
  let validationErrors = {};
  let savedAvaluoId = null; // Para almacenar el ID del avalúo guardado
  let generatingCertificate = false;
  let generatingCertificateId = null; 

  // Use the default structure and override the date
  let formData = getDefaultAvaluoFormData();
  formData.appraisal_date = new Date().toISOString().split('T')[0]; // Set default date for new appraisals

  onMount(async () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
      }
    }
    
    const token = localStorage.getItem('jwtToken');
    if (token) {
    } else {
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
      validationErrors = validateAvaluoFormData(formData, false); 
      
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


      try {
        const response = await apiFetch(ApiUrls.AVALUOS.create, {
          method: 'POST',
          body: JSON.stringify(cleanedFormData)
        });
        
        // Guardar el ID del avalúo creado
        savedAvaluoId = response.id || response.vehicle_appraisal_id;
        successMessage = 'Avalúo guardado correctamente.';
        isSubmitting = false;

      } catch (apiError) {
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
      if (!errorMessage) { // Only set generic message if no specific API or validation error was set
         errorMessage = error.message || 'Ha ocurrido un error al guardar el avalúo.';
      }
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCancel() {
    const confirmed = await confirmCancel();
    if (confirmed) {
      goto('/avaluos');
    }
  }

  // Función para imprimir certificado - Mejorada para evitar bloqueadores de ventanas emergentes
  async function printCertificate(avaluoId) {
    try {
              const token = localStorage.getItem('jwtToken');
        if (!token) {
          showError('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
          setTimeout(() => goto('/login'), 1000);
          return;
        }
      
      // Set generating flag
      generatingCertificate = true;
      generatingCertificateId = avaluoId;
      
      // Make a fetch request with the JWT token in the Authorization header
      const response = await fetch(ApiUrls.CERTIFICADOS.get(avaluoId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener el certificado: ${response.status} ${response.statusText}`);
      }
      
      // Check content type to handle different response types
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        // Handle PDF response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Try multiple methods to open the PDF
        try {
          // Method 1: Try window.open first
          const newWindow = window.open(url, '_blank');
          
          // Check if popup was blocked
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Method 2: Create a temporary link and click it
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = `certificado_${avaluoId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show user message
            setTimeout(() => {
              showInfo('El certificado se está descargando. Si no se abrió automáticamente, revisa tu carpeta de descargas.');
            }, 100);
          }
        } catch (popupError) {
          // Method 3: Fallback to download
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificado_${avaluoId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          showInfo('El certificado se está descargando. Revisa tu carpeta de descargas.');
        }
      } else if (contentType && contentType.includes('application/json')) {
        // Handle JSON response (might contain a URL or error)
        const data = await response.json();
        if (data.url) {
          try {
            const newWindow = window.open(data.url, '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
              // Fallback: open in same window
              window.location.href = data.url;
            }
          } catch (popupError) {
            window.location.href = data.url;
          }
        } else {
          throw new Error(data.message || 'Error al generar el certificado');
        }
      } else {
        // Handle other response types
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        try {
          const newWindow = window.open(url, '_blank');
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = `certificado_${avaluoId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (popupError) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificado_${avaluoId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
          } catch (error) {
        showError(`Error al obtener el certificado: ${error.message}`);
      } finally {
        // Ensure generating flag is reset
        generatingCertificate = false;
        generatingCertificateId = null;
      }
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
        <div class="flex justify-between items-center">
          <span class="block sm:inline">{successMessage}</span>
          <div class="flex gap-2">
            <button 
              on:click={() => printCertificate(savedAvaluoId)}
              disabled={generatingCertificate}
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
            >
              {#if generatingCertificate && generatingCertificateId === savedAvaluoId}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
                </svg>
                Imprimir Certificado
              {/if}
            </button>
            <button 
              on:click={() => goto('/avaluos')}
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Volver a Lista
            </button>
          </div>
        </div>
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
      isEdit={false}
    />

  </main>
</div>
