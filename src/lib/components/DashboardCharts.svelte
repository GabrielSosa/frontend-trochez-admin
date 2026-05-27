<script>
  // This component holds the heavy chart imports (chart.js + svelte-chartjs,
  // ≈ 75 KB gzipped). The dashboard pulls it via `{#await import(...)}` so
  // the rest of the app's JS stays small.
  import { Chart, registerables } from 'chart.js';
  import { Bar, Line, Pie } from 'svelte-chartjs';
  Chart.register(...registerables);

  let {
    dailySalesData,
    monthlySalesData,
    topCarsData,
    chartCommon,
    pieOptions
  } = $props();
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
  <div class="rounded-xl border bg-card text-card-foreground shadow-sm">
    <div class="flex flex-col gap-1.5 p-6">
      <h3 class="text-lg font-semibold leading-none tracking-tight">Avalúos del día</h3>
      <p class="text-sm text-muted-foreground">Valor en CRC por registro</p>
    </div>
    <div class="p-6 pt-0">
      <div class="h-64">
        {#if dailySalesData?.labels?.length}
          <Bar data={dailySalesData} options={chartCommon} />
        {:else}
          <p class="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos para hoy</p>
        {/if}
      </div>
    </div>
  </div>

  <div class="rounded-xl border bg-card text-card-foreground shadow-sm">
    <div class="flex flex-col gap-1.5 p-6">
      <h3 class="text-lg font-semibold leading-none tracking-tight">Avalúos por día (mes)</h3>
      <p class="text-sm text-muted-foreground">Cantidad de registros diarios</p>
    </div>
    <div class="p-6 pt-0">
      <div class="h-64">
        {#if monthlySalesData?.labels?.length}
          <Line data={monthlySalesData} options={chartCommon} />
        {:else}
          <p class="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos para el mes</p>
        {/if}
      </div>
    </div>
  </div>
</div>

<div class="rounded-xl border bg-card text-card-foreground shadow-sm mt-4">
  <div class="flex flex-col gap-1.5 p-6">
    <h3 class="text-lg font-semibold leading-none tracking-tight">Vehículos con más avalúos</h3>
    <p class="text-sm text-muted-foreground">Top 5 del mes</p>
  </div>
  <div class="p-6 pt-0">
    <div class="mx-auto h-72 max-w-md">
      {#if topCarsData?.labels?.length}
        <Pie data={topCarsData} options={pieOptions} />
      {:else}
        <p class="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos</p>
      {/if}
    </div>
  </div>
</div>
