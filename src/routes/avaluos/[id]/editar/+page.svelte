<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import AvaluoForm from '$lib/components/AvaluoForm.svelte'; 
  import { ApiUrls, apiFetch } from '$lib/api';
  import { showSuccess, showError, showInfo } from '$lib/utils/toast.js';
  import { confirmCancel } from '$lib/utils/confirm.js';
  // Import the new function along with the others
  import { validateAvaluoFormData, cleanAvaluoFormData, getDefaultAvaluoFormData, mapApiDataToFormData } from '$lib/utils/avaluoUtils.js';

  // Get the ID from the URL
  let avaluoId = $page.params.id;
  let user = null;
  let isLoading = true;
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';
  let validationErrors = {};
  let savedAvaluoId = null; // Para almacenar el ID del avalúo guardado
  let generatingCertificate = false;
  let generatingCertificateId = null; 

  // Use the default structure. Values will be replaced in onMount.
  let formData = getDefaultAvaluoFormData();

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
      const httpResp = await apiFetch(ApiUrls.AVALUOS.getById(avaluoId));
      const data = await httpResp.json();
      
      // Map API data to form data using shared utility
      formData = mapApiDataToFormData(data);
      
    } catch (error) {
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
    validationErrors = {}; // Reset errors

    try {
      // --- Use Shared Validation ---
      validationErrors = validateAvaluoFormData(formData, true); 
      
      if (Object.keys(validationErrors).length > 0) {
         // Filter out empty messages just in case
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
        // Send the update request
        await apiFetch(ApiUrls.AVALUOS.update(avaluoId), {
          method: 'PUT',
          body: JSON.stringify(cleanedFormData)
        });
        
        // Guardar el ID del avalúo actualizado
        savedAvaluoId = avaluoId;
        successMessage = 'Avalúo actualizado correctamente.';
        isSubmitting = false;

      } catch (apiError) {
         if (apiError.status === 401) {
          localStorage.removeItem('jwtToken');
          setTimeout(() => goto('/login'), 2000);
          errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
        } else if (apiError.status === 422 && apiError.data?.detail) {
           // Handle backend validation errors
           errorMessage = 'Error de validación del servidor. Por favor revise los campos.';
           validationErrors = {}; // Reset frontend errors, show backend ones
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
      if (!errorMessage) { // Only set generic message if no specific API or validation error was set
          errorMessage = error.message || 'Ha ocurrido un error al actualizar el avalúo.';
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Handle cancel event from AvaluoForm
  async function handleCancel() {
    const confirmed = await confirmCancel();
    if (confirmed) {
      goto('/avaluos');
    }
  }

  // Función para imprimir certificado
  async function printCertificate(avaluoId) {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        showError('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
        setTimeout(() => goto('/login'), 1000);
        return;
      }

      generatingCertificate = true;
      generatingCertificateId = avaluoId;

      const response = await fetch(ApiUrls.CERTIFICADOS.get(avaluoId), {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        let errMsg = `Error ${response.status}`;
        try { const j = await response.json(); errMsg = j.detail || j.message || errMsg; } catch(e) {}
        throw new Error(errMsg);
      }

      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const newWin = window.open(url, '_blank');
        if (!newWin) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificado_${avaluoId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showInfo('El certificado se está descargando. Revisa tu carpeta de descargas.');
        }
      } else {
        // HTML certificate — render in new window regardless of Content-Type
        const htmlText = await response.text();
        if (htmlText.trimStart().startsWith('{')) {
          try {
            const j = JSON.parse(htmlText);
            throw new Error(j.detail || j.message || 'Error al generar el certificado');
          } catch(e) { if (!(e instanceof SyntaxError)) throw e; }
        }
        const newWin = window.open('', '_blank');
        if (newWin) {
          newWin.document.open();
          newWin.document.write(htmlText);
          newWin.document.close();
          newWin.onload = () => newWin.print();
          setTimeout(() => { try { newWin.print(); } catch(e2) {} }, 800);
        } else {
          const blob = new Blob([htmlText], { type: 'text/html; charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificado_${avaluoId}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showInfo('El certificado se descargó. Ábrelo en el navegador y usa Imprimir → Guardar como PDF.');
        }
      }
    } catch (error) {
      showError(`Error al obtener el certificado: ${error.message}`);
    } finally {
      generatingCertificate = false;
      generatingCertificateId = null;
    }
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
    {:else if errorMessage}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
        <span class="block sm:inline font-medium">Error:</span>
        <span class="block sm:inline">{errorMessage}{Object.keys(validationErrors).length > 0 ? ' Corrige los siguientes campos:' : ''}</span>
        {#if Object.keys(validationErrors).length > 0}
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

      <!-- Use the reusable form component -->
      <AvaluoForm 
        bind:formData
        {validationErrors} 
        {isSubmitting}
        on:submit={handleSubmit}
        on:cancel={handleCancel}
        isEdit={true}
      />
    {/if}
  </main>
</div>
