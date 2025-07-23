<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import { ApiUrls, apiFetch } from '$lib/api';

  let user = null;
  let searchQuery = '';
  let avaluos = [];
  let filteredAvaluos = [];
  let isLoading = true;
  let searchTimeout = null;
  let isSearching = false;
  
  // Pagination variables
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 0;
  let total = 0;
  let paginatedAvaluos = [];
  let generatingCertificate = false;
  let generatingCertificateId = null;
  let isChangingPage = false;


  // Function to load avalúos data with backend pagination
  async function loadAvaluos(page = 1, search = '') {
    try {
      isLoading = true;
      
      let url;
      let params;
      
      if (search && search.trim()) {
        // Use search endpoint
        params = new URLSearchParams({
          query: search.trim(),
          page: page.toString(),
          limit: itemsPerPage.toString()
        });
        url = `https://api-backend-trochez.onrender.com/api/appraisals/search?${params}`;
      } else {
        // Use regular endpoint
        params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString()
        });
        url = `${ApiUrls.AVALUOS.getAll}?${params}`;
      }
      
      const response = await apiFetch(url);
      
      // Handle different response formats
      let data;
      
      if (response.data && response.pagination) {
        // New format with pagination metadata
        data = response.data;
        total = response.pagination.total_count;
        totalPages = response.pagination.total_pages;

      } else if (response.avaluos && response.total !== undefined) {
        // Alternative format with pagination metadata
        data = response.avaluos;
        total = response.total;
        totalPages = response.totalPages || Math.ceil(total / itemsPerPage);
      } else {
        // Fallback to old format
        data = response;
        total = data.length;
        totalPages = 1;
      }
      
      avaluos = data.map(item => ({
        id: item.id,
        vehicle_appraisal_id: item.vehicle_appraisal_id || item.id,
        fecha: item.appraisal_date || '',
        cliente: item.applicant || '',
        vehiculo: `${item.brand || ''} ${item.vehicle_description || ''} ${item.model_year || ''}`.trim(),
        placa: item.plate_number || '',
        valor: item.appraisal_value_trochez, 
        color: item.color || '',
        kilometraje: item.mileage || '',
        combustible: item.fuel_type || '',
        motor: item.engine_size || '',
        propietario: item.owner || '',
        valorUSD: item.appraisal_value_usd,
        vin: item.vin || '',
        numeroMotor: item.engine_number || '',
        notas: item.notes || '',
        validezDias: item.validity_days,
        validezKms: item.validity_kms,
        extras: item.extras || '',
        deduccion: item.deductions || '',
        cert: item.cert || ''
      }));
      
      // Update pagination variables
      filteredAvaluos = [...avaluos];
      currentPage = page;
      updatePageData();
      
      // Clear any previous search results to avoid duplicates
      if (search) {
        // If searching, we only want the current page results
        filteredAvaluos = [...avaluos];
      }
      

      
    } catch (error) {
      // Provide more detailed error information
      let errorMessage = 'Error al cargar los avalúos.';
      
      if (error.status === 401) {
        errorMessage = 'Error de autenticación. Por favor, inicie sesión nuevamente.';
        // Redirect to login page after a short delay
        setTimeout(() => goto('/login'), 2000);
      } else if (error.message) {
        errorMessage += ' ' + error.message;
      }
      
      // Provide some feedback to the user
      alert(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    // Get user data from localStorage if available
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        
      }
    }

    // Load avalúos data
    await loadAvaluos(1, '');

    // Add visibility change listener to reload data when returning from other pages
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Reload data when page becomes visible (user returns from create/edit)
        loadAvaluos(1, searchQuery);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

  // Search avalúos using backend with debounce
  function handleSearch() {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Show searching indicator
    isSearching = true;
    
    // Set new timeout for 500ms
    searchTimeout = setTimeout(async () => {
      // Reset to first page when searching
      currentPage = 1;
      await loadAvaluos(currentPage, searchQuery);
      
      // Hide searching indicator
      isSearching = false;
    }, 500);
  }
  
  // Update the current page data (now using backend pagination)
  function updatePageData() {
    // With backend pagination, the data is already paginated
    paginatedAvaluos = [...filteredAvaluos];
  }
  
  // Helper function to create array for pagination
  function createPageArray(count) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  
  // Go to specific page using backend
  async function goToPage(page) {
    if (page >= 1 && page <= totalPages && !isChangingPage) {
      isChangingPage = true;
      currentPage = page;
      try {
        await loadAvaluos(page, searchQuery);
      } finally {
        isChangingPage = false;
      }
    }
  }

  // Navigate to create new avalúo page
  function handleCreateNew() {
    goto('/avaluos/nuevo');
  }

  // Format currency
  function formatCurrency(value) {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(value);
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return new Intl.DateTimeFormat('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
  
  // Open certificate with JWT token
  async function openCertificate(avaluoId) {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert('No se encontró token de autenticación. Por favor inicie sesión nuevamente.');
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
        window.open(url, '_blank');
      } else if (contentType && contentType.includes('application/json')) {
        // Handle JSON response (might contain a URL or error)
        const data = await response.json();
        if (data.url) {
          window.open(data.url, '_blank');
        } else {
          throw new Error(data.message || 'Error al generar el certificado');
        }
      } else {
        // Handle other response types
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      
      alert(`Error al obtener el certificado: ${error.message}`);
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
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Avalúos</h1>
      <div class="flex gap-2">
        <button 
          on:click={() => loadAvaluos(1, searchQuery)}
          disabled={isLoading}
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
        <button 
          on:click={handleCreateNew}
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo Avalúo
        </button>
      </div>
    </div>

        <!-- Search and filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex-1">
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Buscar Avalúos</label>
        <div class="relative">
          <input
            id="search"
            type="text"
            bind:value={searchQuery}
            on:input={handleSearch}
            placeholder="Buscar por placa, cliente, vehículo, VIN, certificado..."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {#if isSearching}
              <div class="animate-spin h-5 w-5 border-b-2 border-blue-600 rounded-full"></div>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Avalúos table -->
    <div class="bg-white rounded-lg shadow overflow-hidden max-w-full">
      {#if isLoading}
        <div class="p-8 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if filteredAvaluos.length === 0}
        <div class="p-8 text-center text-gray-500">
          No se encontraron avalúos que coincidan con la búsqueda.
        </div>
      {:else if paginatedAvaluos.length === 0 && filteredAvaluos.length > 0}
        <div class="p-8 text-center text-gray-500">
          Cargando datos para la página actual...
        </div>
      {:else}
        <div class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg" style="scrollbar-width: thin; scrollbar-color: #d1d5db #f3f4f6;">
          <table class="min-w-full divide-y divide-gray-200" style="min-width: 900px;">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Certificado</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each paginatedAvaluos as avaluo (avaluo.vehicle_appraisal_id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{avaluo.vehicle_appraisal_id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{avaluo.cert || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(avaluo.fecha)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avaluo.cliente}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avaluo.vehiculo}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avaluo.placa}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(avaluo.valor)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avaluo.color}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={`/avaluos/${avaluo.vehicle_appraisal_id}/editar`} class="text-indigo-600 hover:text-indigo-900 mr-3">Editar</a>
                    <button 
                      on:click={() => openCertificate(avaluo.vehicle_appraisal_id)} 
                      class="text-green-600 hover:text-green-900 bg-transparent border-none p-0 cursor-pointer text-sm font-medium inline-flex items-center"
                      disabled={generatingCertificate}
                    >
                      {#if generatingCertificate && generatingCertificateId === avaluo.vehicle_appraisal_id}
                        <div class="animate-spin h-4 w-4 border-b-2 border-green-600 rounded-full mr-2"></div>
                        Generando...
                      {:else}
                        Certificado
                      {/if}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        
        <!-- Pagination controls -->

        
        {#if totalPages > 1}
          <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="flex-1 flex justify-between sm:hidden">
              <div class="flex items-center space-x-2">
                <label for="itemsPerPageMobile" class="text-xs text-gray-700">Registros:</label>
                <select
                  id="itemsPerPageMobile"
                  bind:value={itemsPerPage}
                  on:change={() => loadAvaluos(1, searchQuery)}
                  class="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div class="flex space-x-2">
                <button 
                  on:click={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1 || isChangingPage}
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if isChangingPage}
                    <div class="animate-spin h-4 w-4 border-b-2 border-gray-600 rounded-full mr-2"></div>
                  {/if}
                  Anterior
                </button>
                <button 
                  on:click={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages || isChangingPage}
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if isChangingPage}
                    <div class="animate-spin h-4 w-4 border-b-2 border-gray-600 rounded-full mr-2"></div>
                  {/if}
                  Siguiente
                </button>
              </div>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <p class="text-sm text-gray-700">
                    Mostrando <span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span class="font-medium">{Math.min(currentPage * itemsPerPage, filteredAvaluos.length)}</span> de <span class="font-medium">{total}</span> resultados
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <label for="itemsPerPage" class="text-sm text-gray-700">Registros:</label>
                  <select
                    id="itemsPerPage"
                    bind:value={itemsPerPage}
                    on:change={() => loadAvaluos(1, searchQuery)}
                    class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <!-- Previous page button -->
                  <button
                    on:click={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || isChangingPage}
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Anterior</span>
                    {#if isChangingPage}
                      <div class="animate-spin h-4 w-4 border-b-2 border-gray-600 rounded-full"></div>
                    {:else}
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    {/if}
                  </button>
                  
                  <!-- Page numbers -->
                  {#each createPageArray(totalPages) as pageNum}
                    {#if pageNum === currentPage || pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
                      <button
                        on:click={() => goToPage(pageNum)}
                        disabled={isChangingPage}
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium {currentPage === pageNum ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pageNum}
                      </button>
                    {:else if pageNum === currentPage - 2 || pageNum === currentPage + 2}
                      <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    {/if}
                  {/each}
                  
                  <!-- Next page button -->
                  <button
                    on:click={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || isChangingPage}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Siguiente</span>
                    {#if isChangingPage}
                      <div class="animate-spin h-4 w-4 border-b-2 border-gray-600 rounded-full"></div>
                    {:else}
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    {/if}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>

<style>
  /* Estilos personalizados para el scrollbar */
  .overflow-x-auto::-webkit-scrollbar {
    height: 8px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
