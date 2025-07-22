<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Chart, registerables } from 'chart.js';
  import { Bar, Line, Pie } from 'svelte-chartjs';
  import Navbar from '$lib/components/Navbar.svelte';
  import { ApiUrls, apiFetch } from '$lib/api';

  // Register Chart.js components
  Chart.register(...registerables);

  let user = null;
  let isLoading = true;
  let errorDashboard = '';

  // Estados para los datos del dashboard
  let summary = null;
  let dailySalesData = null;
  let monthlySalesData = null;
  let topCarsData = null;

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventas del Día'
      }
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventas Mensuales'
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Carros con Más Avalúos'
      }
    }
  };

  onMount(async () => {
    // Get user data from localStorage if available
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {}
    }

    isLoading = true;
    errorDashboard = '';
    try {
      const [summaryRes, ventasDia, ventasMes, carrosTop] = await Promise.all([
        apiFetch(ApiUrls.DASHBOARD.summary),
        apiFetch(ApiUrls.DASHBOARD.ventasDia),
        apiFetch(ApiUrls.DASHBOARD.ventasMes),
        apiFetch(ApiUrls.DASHBOARD.carrosMasAvaluos),
      ]);
      summary = summaryRes;
      dailySalesData = {
        labels: ventasDia.labels,
        datasets: [{
          label: 'Ventas del día',
          data: ventasDia.values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };
      monthlySalesData = {
        labels: ventasMes.labels,
        datasets: [{
          label: 'Ventas del mes',
          data: ventasMes.values,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          tension: 0.4
        }]
      };
      topCarsData = {
        labels: carrosTop.labels,
        datasets: [{
          label: 'Carros con más avalúos',
          data: carrosTop.values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      };
    } catch (err) {
      errorDashboard = 'Error al cargar el dashboard: ' + (err.message || 'Error desconocido');
    } finally {
      isLoading = false;
    }
  });

  function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
    goto('/login');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Navbar -->
  <Navbar {user} />

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
    {#if isLoading}
      <div class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span class="ml-4 text-gray-500">Cargando dashboard...</span>
      </div>
    {:else if errorDashboard}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
        <span class="block sm:inline font-medium">{errorDashboard}</span>
      </div>
    {:else}
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">Total Avalúos</h2>
          <p class="text-3xl font-bold text-blue-600">{summary?.total_avaluos ?? '-'}</p>
          <p class="text-sm text-gray-500 mt-1">{summary?.total_avaluos_variation ?? ''} vs. periodo anterior</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">Ingresos Totales</h2>
          <p class="text-3xl font-bold text-green-600">{summary ? `₡${summary.total_ingresos.toLocaleString('es-CR')}` : '-'}</p>
          <p class="text-sm text-gray-500 mt-1">{summary?.total_ingresos_variation ?? ''} vs. periodo anterior</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">Clientes Nuevos</h2>
          <p class="text-3xl font-bold text-purple-600">{summary?.clientes_nuevos ?? '-'}</p>
          <p class="text-sm text-gray-500 mt-1">{summary?.clientes_nuevos_variation ?? ''} vs. periodo anterior</p>
        </div>
      </div>
      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          {#if dailySalesData}
            <Bar data={dailySalesData} options={barOptions} />
          {:else}
            <div class="text-gray-400 text-center py-8">Sin datos de ventas diarias</div>
          {/if}
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          {#if monthlySalesData}
            <Line data={monthlySalesData} options={lineOptions} />
          {:else}
            <div class="text-gray-400 text-center py-8">Sin datos de ventas mensuales</div>
          {/if}
        </div>
      </div>
      <div class="grid grid-cols-1 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="max-w-md mx-auto">
            {#if topCarsData}
              <Pie data={topCarsData} options={pieOptions} />
            {:else}
              <div class="text-gray-400 text-center py-8">Sin datos de carros</div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>
