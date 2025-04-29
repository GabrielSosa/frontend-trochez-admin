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
  
  // Pagination variables
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 0;
  let paginatedAvaluos = [];
  let generatingCertificate = false;
  let generatingCertificateId = null;


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

    // Fetch avalúos from API
    try {
      isLoading = true;
      
      // Debug: Check if token exists
      const token = localStorage.getItem('jwtToken');
      console.log('Token en avaluos page:', token ? 'Existe' : 'No existe');
      if (token) {
        console.log('Token value:', token.substring(0, 20) + '...');
      }
      
      const data = await apiFetch(ApiUrls.AVALUOS.getAll);
      avaluos = data.map(item => ({
        id: item.id,
        vehicle_appraisal_id: item.vehicle_appraisal_id || item.id, // Use vehicle_appraisal_id if available, otherwise use id
        fecha: item.appraisal_date,
        cliente: item.applicant,
        vehiculo: `${item.brand} ${item.vehicle_description} ${item.model_year}`,
        placa: item.plate_number,
        valor: item.appraisal_value_trochez, 
        color: item.color,
        kilometraje: item.mileage,
        combustible: item.fuel_type,
        motor: item.engine_size,
        propietario: item.owner,
        valorUSD: item.appraisal_value_usd,
        vin: item.vin,
        numeroMotor: item.engine_number,
        notas: item.notes,
        validezDias: item.validity_days,
        validezKms: item.validity_kms,
        extras: item.extras,
        deduccion: item.deductions
      }));
      filteredAvaluos = [...avaluos];
      updatePagination();
    } catch (error) {
      console.error('Error fetching avalúos:', error);
      
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
  });

  // Filter avalúos based on search query
  function handleSearch() {
    if (!searchQuery.trim()) {
      filteredAvaluos = [...avaluos];
    } else {
      const query = searchQuery.toLowerCase();
      filteredAvaluos = avaluos.filter(avaluo => 
        (avaluo.cliente && avaluo.cliente.toLowerCase().includes(query)) ||
        (avaluo.vehiculo && avaluo.vehiculo.toLowerCase().includes(query)) ||
        (avaluo.placa && avaluo.placa.toLowerCase().includes(query)) ||
        (avaluo.color && avaluo.color.toLowerCase().includes(query)) ||
        (avaluo.vin && avaluo.vin.toLowerCase().includes(query))
      );
    }
    
    // Reset to first page when searching
    currentPage = 1;
    updatePagination();
  }
  
  // Update pagination based on current filters
  function updatePagination() {
    totalPages = Math.ceil(filteredAvaluos.length / itemsPerPage);
    updatePageData();
  }
  
  // Update the current page data
  function updatePageData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedAvaluos = filteredAvaluos.slice(startIndex, endIndex);
  }
  
  // Go to specific page
  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      updatePageData();
    }
  }

  // Navigate to create new avalúo page
  function handleCreateNew() {
    goto('/avaluos/nuevo');
  }

  // Format currency
  function formatCurrency(value) {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(value);
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-HN', {
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
      console.error('Error al obtener el certificado:', error);
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

    <!-- Search and filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Buscar Avalúos</label>
          <div class="relative">
            <input
              id="search"
              type="text"
              bind:value={searchQuery}
              on:input={handleSearch}
              placeholder="Buscar por cliente, vehículo, placa, color o VIN..."
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Avalúos table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
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
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
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
              <button 
                on:click={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button 
                on:click={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Mostrando <span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span class="font-medium">{Math.min(currentPage * itemsPerPage, filteredAvaluos.length)}</span> de <span class="font-medium">{filteredAvaluos.length}</span> resultados
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <!-- Previous page button -->
                  <button
                    on:click={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Anterior</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <!-- Page numbers -->
                  {#each Array(totalPages) as _, i}
                    {#if i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
                      <button
                        on:click={() => goToPage(i + 1)}
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium {currentPage === i + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}"
                      >
                        {i + 1}
                      </button>
                    {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
                      <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    {/if}
                  {/each}
                  
                  <!-- Next page button -->
                  <button
                    on:click={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Siguiente</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
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
