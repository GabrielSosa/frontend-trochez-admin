<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Chart, registerables } from 'chart.js';
  import { Bar, Line, Pie } from 'svelte-chartjs';
  import Navbar from '$lib/components/Navbar.svelte';

  // Register Chart.js components
  Chart.register(...registerables);

  let user = null;
  let dailySalesData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Ventas del día',
      data: [12500, 15000, 8700, 9800, 14500, 18000, 11200],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  let monthlySalesData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Ventas del mes',
      data: [85000, 92000, 78000, 105000, 120000, 98000, 115000, 125000, 95000, 110000, 130000, 145000],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      tension: 0.4
    }]
  };

  let topCarsData = {
    labels: ['Toyota Hilux', 'Honda CR-V', 'Toyota Corolla', 'Nissan Frontier', 'Hyundai Tucson'],
    datasets: [{
      label: 'Carros con más avalúos',
      data: [48, 42, 37, 32, 28],
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

  onMount(() => {
    // Get user data from localStorage if available
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
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
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Total Avalúos</h2>
        <p class="text-3xl font-bold text-blue-600">187</p>
        <p class="text-sm text-gray-500 mt-1">+12% vs. mes anterior</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Ingresos Totales</h2>
        <p class="text-3xl font-bold text-green-600">$1,245,000</p>
        <p class="text-sm text-gray-500 mt-1">+8% vs. mes anterior</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Clientes Nuevos</h2>
        <p class="text-3xl font-bold text-purple-600">32</p>
        <p class="text-sm text-gray-500 mt-1">+15% vs. mes anterior</p>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <Bar data={dailySalesData} options={barOptions} />
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <Line data={monthlySalesData} options={lineOptions} />
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="max-w-md mx-auto">
          <Pie data={topCarsData} options={pieOptions} />
        </div>
      </div>
    </div>
  </main>
</div>
