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

      // ventasDia: { date, items: [{vehicle_appraisal_id, appraisal_date, brand, vehicle_description, plate_number, owner, appraisal_value_trochez, ...}], total }
      const diaItems = diaJson.items ?? [];
      dailySalesData = {
        labels: diaItems.map(i => i.plate_number || i.owner || 'N/A'),
        datasets: [{
          label: 'Valor Avalúo (₡)',
          data: diaItems.map(i => i.appraisal_value_trochez ?? 0),
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

      // carrosMasAvaluos: { items: [{ brand, vehicle_description, count }] }
      const carrosItems = (carrosJson.items ?? []).slice(0, 5);
      topCarsData = {
        labels: carrosItems.map(i => (i.brand + (i.vehicle_description ? ' ' + i.vehicle_description : '')).trim() || 'N/A'),
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

<Navbar {user} on:logout={handleLogout} />

<main class="container mx-auto px-4 py-8">
  {#if isLoading}
    <div class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Cargando dashboard...</span>
    </div>
  {:else if errorDashboard}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorDashboard}
    </div>
  {:else}
    <!-- Summary Cards -->
    {#if summaryData}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-500 text-sm font-medium">Avalúos este mes</h3>
          <p class="text-3xl font-bold text-blue-600">{summaryData.current_month?.count ?? 0}</p>
          {#if summaryData.deltas}
            <p class="text-sm text-gray-500 mt-1">
              {summaryData.deltas.count_pct >= 0 ? '+' : ''}{summaryData.deltas.count_pct}% vs mes anterior
            </p>
          {/if}
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-500 text-sm font-medium">Valor total avalúos (₡)</h3>
          <p class="text-3xl font-bold text-green-600">
            {(summaryData.current_month?.total_final_value ?? 0).toLocaleString('es-CR')}
          </p>
          {#if summaryData.deltas}
            <p class="text-sm text-gray-500 mt-1">
              {summaryData.deltas.final_value_pct >= 0 ? '+' : ''}{summaryData.deltas.final_value_pct}% vs mes anterior
            </p>
          {/if}
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-500 text-sm font-medium">Avalúos hoy</h3>
          <p class="text-3xl font-bold text-purple-600">{ventasDiaData?.total ?? 0}</p>
        </div>
      </div>
    {/if}

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {#if dailySalesData}
        <div class="bg-white rounded-lg shadow p-6">
          <Bar data={dailySalesData} options={barOptions} />
        </div>
      {/if}
      {#if monthlySalesData}
        <div class="bg-white rounded-lg shadow p-6">
          <Line data={monthlySalesData} options={lineOptions} />
        </div>
      {/if}
    </div>

    {#if topCarsData}
      <div class="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <Pie data={topCarsData} options={pieOptions} />
      </div>
    {/if}
  {/if}
</main>
