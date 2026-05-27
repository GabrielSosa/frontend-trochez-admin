<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Chart, registerables } from 'chart.js';
  import { Bar, Line, Pie } from 'svelte-chartjs';
  import { ApiUrls, apiJson } from '$lib/api.js';
  import { auth } from '$lib/stores/auth.svelte.js';
  import { formatCRC } from '$lib/utils.js';
  import { showError, showSuccess } from '$lib/utils/toast.js';
  import { FileSpreadsheet, TrendingUp, Wallet, Calendar, RefreshCw } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';

  Chart.register(...registerables);

  let isLoading = $state(true);
  let errorDashboard = $state('');
  let summaryData = $state(null);
  let ventasDiaData = $state(null);
  let ventasMesData = $state(null);
  let carrosTopData = $state(null);

  let dailySalesData = $state(null);
  let monthlySalesData = $state(null);
  let topCarsData = $state(null);

  // Read CSS vars at runtime so charts use the theme palette.
  function themeColor(varName, alpha = 1) {
    if (typeof window === 'undefined') return `rgba(0,0,0,${alpha})`;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!raw) return `rgba(0,0,0,${alpha})`;
    return `hsla(${raw} / ${alpha})`;
  }

  const chartCommon = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { precision: 0 } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
  };

  async function load() {
    isLoading = true;
    errorDashboard = '';
    try {
      const [summary, dia, mes, carros] = await Promise.all([
        apiJson(ApiUrls.DASHBOARD.summary),
        apiJson(ApiUrls.DASHBOARD.ventasDia),
        apiJson(ApiUrls.DASHBOARD.ventasMes),
        apiJson(ApiUrls.DASHBOARD.carrosMasAvaluos)
      ]);
      summaryData = summary;
      ventasDiaData = dia;
      ventasMesData = mes;
      carrosTopData = carros;

      const primary = themeColor('--primary', 1);
      const primarySoft = themeColor('--primary', 0.18);

      const diaItems = dia?.items ?? [];
      dailySalesData = {
        labels: diaItems.map((i) => i.plate_number || i.owner || 'N/A'),
        datasets: [
          {
            label: 'Valor Avalúo (₡)',
            data: diaItems.map((i) => i.appraisal_value_trochez ?? 0),
            backgroundColor: primarySoft,
            borderColor: primary,
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      };

      const mesItems = mes?.items ?? [];
      monthlySalesData = {
        labels: mesItems.map((i) => i.day),
        datasets: [
          {
            label: 'Avalúos por día',
            data: mesItems.map((i) => i.count),
            backgroundColor: primarySoft,
            borderColor: primary,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 2
          }
        ]
      };

      const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
      const carrosItems = (carros?.items ?? []).slice(0, 5);
      topCarsData = {
        labels: carrosItems.map((i) =>
          `${i.brand ?? ''} ${i.vehicle_description ?? ''}`.trim() || 'N/A'
        ),
        datasets: [
          {
            label: 'Cantidad de Avalúos',
            data: carrosItems.map((i) => i.count),
            backgroundColor: palette,
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      };
    } catch (err) {
      errorDashboard = err.message ?? 'Error desconocido al cargar el dashboard';
    } finally {
      isLoading = false;
    }
  }

  async function refresh() {
    await load();
    showSuccess('Datos actualizados');
  }

  onMount(() => {
    if (!auth.isAuthenticated) {
      goto('/login');
      return;
    }
    load();
  });

  let monthCount = $derived(summaryData?.current_month?.count ?? 0);
  let monthValue = $derived(summaryData?.current_month?.total_final_value ?? 0);
  let monthDeltaCount = $derived(summaryData?.deltas?.count_pct ?? 0);
  let monthDeltaValue = $derived(summaryData?.deltas?.final_value_pct ?? 0);
  let todayCount = $derived(ventasDiaData?.total ?? (ventasDiaData?.items?.length ?? 0));

  function pctBadge(v) {
    if (v == null) return { variant: 'secondary', label: '—' };
    const num = Number(v);
    if (Number.isNaN(num)) return { variant: 'secondary', label: '—' };
    return {
      variant: num >= 0 ? 'success' : 'destructive',
      label: `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
    };
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p class="text-sm text-muted-foreground">Resumen de la actividad mensual y diaria</p>
    </div>
    <Button variant="outline" onclick={refresh} disabled={isLoading}>
      {#if isLoading}
        <Spinner size={14} />
      {:else}
        <RefreshCw size={14} />
      {/if}
      Actualizar
    </Button>
  </div>

  {#if errorDashboard}
    <Card class="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
      {errorDashboard}
    </Card>
  {/if}

  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Avalúos este mes</CardTitle>
        <FileSpreadsheet size={18} class="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-3xl font-semibold tabular-nums">{monthCount}</div>
        {#if summaryData?.deltas}
          {@const b = pctBadge(monthDeltaCount)}
          <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={b.variant}>{b.label}</Badge>
            vs mes anterior
          </div>
        {/if}
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Valor total mes</CardTitle>
        <Wallet size={18} class="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-3xl font-semibold tabular-nums">{formatCRC(monthValue)}</div>
        {#if summaryData?.deltas}
          {@const b = pctBadge(monthDeltaValue)}
          <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={b.variant}>{b.label}</Badge>
            vs mes anterior
          </div>
        {/if}
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Avalúos hoy</CardTitle>
        <Calendar size={18} class="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-3xl font-semibold tabular-nums">{todayCount}</div>
        <p class="mt-2 text-xs text-muted-foreground">Registros del día actual</p>
      </CardContent>
    </Card>
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Avalúos del día</CardTitle>
        <p class="text-sm text-muted-foreground">Valor en CRC por registro</p>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          {#if isLoading}
            <div class="flex h-full items-center justify-center"><Spinner /></div>
          {:else if dailySalesData?.labels.length}
            <Bar data={dailySalesData} options={chartCommon} />
          {:else}
            <p class="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos para hoy</p>
          {/if}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Avalúos por día (mes)</CardTitle>
        <p class="text-sm text-muted-foreground">Cantidad de registros diarios</p>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          {#if isLoading}
            <div class="flex h-full items-center justify-center"><Spinner /></div>
          {:else if monthlySalesData?.labels.length}
            <Line data={monthlySalesData} options={chartCommon} />
          {:else}
            <p class="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos para el mes</p>
          {/if}
        </div>
      </CardContent>
    </Card>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Vehículos con más avalúos</CardTitle>
      <p class="text-sm text-muted-foreground">Top 5 del mes</p>
    </CardHeader>
    <CardContent>
      <div class="mx-auto h-72 max-w-md">
        {#if isLoading}
          <div class="flex h-full items-center justify-center"><Spinner /></div>
        {:else if topCarsData?.labels.length}
          <Pie data={topCarsData} options={pieOptions} />
        {:else}
          <p class="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos</p>
        {/if}
      </div>
    </CardContent>
  </Card>
</div>
