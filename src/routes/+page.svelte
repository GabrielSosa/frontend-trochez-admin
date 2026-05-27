<script>
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Pie } from 'svelte-chartjs';
import Navbar from '$lib/components/Navbar.svelte';
import { ApiUrls, apiFetch } from '$lib/api';

Chart.register(...registerables);

let user = null;
let isLoading = true;
let errorDashboard = '';

// Raw API responses
let summaryData = null;
let ventasDiaData = null;
let ventasMesData = null;
let carrosTopData = null;

// Chart datasets
let dailySalesData = null;
let monthlySalesData = null;
let topCarsData = null;

const barOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, title: { display: true, text: 'Avalúos del Día' } }
};
const lineOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, title: { display: true, text: 'Avalúos del Mes' } }
};
const pieOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, title: { display: true, text: 'Carros con Más Avalúos' } }
};

onMount(async () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try { user = JSON.parse(userData); } catch (e) {}
  }

  isLoading = true;
  errorDashboard = '';
  try {
    const [summaryRes, diaRes, mesRes, carrosRes] = await Promise.all([
      apiFetch(ApiUrls.DASHBOARD.summary),
      apiFetch(ApiUrls.DASHBOARD.ventasDia),
      apiFetch(ApiUrls.DASHBOARD.ventasMes),
      apiFetch(ApiUrls.DASHBOARD.carrosMasAvaluos),
    ]);

    const [summaryJson, diaJson, mesJson, carrosJson] = await Promise.all([
      summaryRes.json(),
      diaRes.json(),
      mesRes.json(),
      carrosRes.json(),
    ]);

    summaryData = summaryJson;
    ventasDiaData = diaJson;
    ventasMesData = mesJson;
    carrosTopData = carrosJson;

    // Build chart data from API responses
    // ventasDia: { date, items: [...], total }
    const diaItems = diaJson.items ?? [];
    dailySalesData = {
      labels: diaItems.map(i => i.vehicle_plate || i.owner_name || 'N/A'),
      datasets: [{
        label: 'Valor Final (₡)',
        data: diaItems.map(i => i.final_value ?? 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    // ventasMes: { start, end, items: [{ day, count, total_final_value, total_base_value }] }
    const mesItems = mesJson.items ?? [];
    monthlySalesData = {
      labels: mesItems.map(i => i.day),
      datasets: [{
        label: 'Avalúos por día',
        data: mesItems.map(i => i.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        tension: 0.4
      }]
    };

    // carrosMasAvaluos: { items: [{ vehicle_brand, vehicle_model, count }] }
    const carrosItems = (carrosJson.items ?? []).slice(0, 5);
    topCarsData = {
      labels: carrosItems.map(i => (i.vehicle_brand + ' ' + i.vehicle_model).trim() || 'N/A'),
      datasets: [{
        label: 'Cantidad de Avalúos',
        data: carrosItems.map(i => i.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
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
  <Navbar {user} />
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
          <h2 class="text-lg font-semibold text-gray-700 mb-2">Avalúos (Mes Actual)</h2>
          <p class="text-3xl font-bold text-blue-600">{summaryData?.current_month?.count ?? '-'}</p>
          <p class="text-sm text-gray-500 mt-1">Mes anterior: {summaryData?.previous_month?.count ?? '-'}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">Valor Final Total (Mes)</h2>
          <p class="text-3xl font-bold text-green-600">
            {summaryData?.current_month?.total_final_value != null
              ? '₡' + summaryData.current_month.total_final_value.toLocaleString('es-CR')
              : '-'}
          </p>
          <p class="text-sm text-gray-500 mt-1">Variación: {summaryData?.deltas?.final_value_pct ?? '-'}%</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">Avalúos Hoy</h2>
          <p class="text-3xl font-bold text-purple-600">{ventasDiaData?.total ?? '-'}</p>
          <p class="text-sm text-gray-500 mt-1">{ventasDiaData?.date ?? ''}</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          {#if dailySalesData && dailySalesData.labels.length > 0}
            <Bar data={dailySalesData} options={barOptions} />
          {:else}
            <div class="text-gray-400 text-center py-8">Sin avalúos hoy</div>
          {/if}
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          {#if monthlySalesData && monthlySalesData.labels.length > 0}
            <Line data={monthlySalesData} options={lineOptions} />
          {:else}
            <div class="text-gray-400 text-center py-8">Sin datos de avalúos mensuales</div>
          {/if}
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="max-w-md mx-auto">
            {#if topCarsData && topCarsData.labels.length > 0}
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
