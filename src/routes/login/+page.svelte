<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiUrls } from '$lib/api.js';
  import { auth } from '$lib/stores/auth.svelte.js';
  import { showError, showSuccess } from '$lib/utils/toast.js';
  import { Loader2, LogIn } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Label from '$lib/components/ui/Label.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state('');

  onMount(() => {
    if (auth.isAuthenticated) goto('/');
  });

  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const response = await fetch(ApiUrls.AUTH.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Error al iniciar sesión');
      }
      const token = data.token || data.accessToken || data.access_token || data.jwt;
      if (!token) throw new Error('No se pudo obtener el token de autenticación');
      auth.setSession(token, data.user || data.userData || { email });
      showSuccess('Bienvenido');
      goto('/');
    } catch (err) {
      error = err.message || 'Error al iniciar sesión';
      showError(error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="grid min-h-screen lg:grid-cols-2">
  <!-- Left: hero panel -->
  <div class="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-blue-700 p-10 text-primary-foreground">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 backdrop-blur font-bold">T</div>
      <span class="text-lg font-semibold tracking-tight">Avalúos Trochez</span>
    </div>
    <div class="max-w-md space-y-3">
      <h2 class="text-4xl font-semibold leading-tight">Panel de administración</h2>
      <p class="text-white/80">
        Gestioná avalúos vehiculares, deducciones y certificados desde un solo lugar.
      </p>
    </div>
    <p class="text-xs text-white/60">© {new Date().getFullYear()} Avalúos Trochez</p>
  </div>

  <!-- Right: login card -->
  <div class="flex items-center justify-center bg-background p-6">
    <Card class="w-full max-w-md">
      <CardContent class="p-8">
        <div class="mb-6 lg:hidden">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">T</div>
            <span class="text-lg font-semibold tracking-tight">Avalúos Trochez</span>
          </div>
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p class="mt-1 text-sm text-muted-foreground">Ingresá tus credenciales para continuar</p>

        <form onsubmit={handleLogin} class="mt-6 space-y-4">
          {#if error}
            <div class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          {/if}

          <div class="space-y-2">
            <Label for="email">Correo electrónico</Label>
            <Input id="email" type="email" bind:value={email} placeholder="usuario@trochez.com" required autocomplete="email" />
          </div>

          <div class="space-y-2">
            <Label for="password">Contraseña</Label>
            <Input id="password" type="password" bind:value={password} placeholder="••••••••" required autocomplete="current-password" />
          </div>

          <Button type="submit" class="w-full" disabled={loading}>
            {#if loading}
              <Loader2 size={16} class="animate-spin" /> Iniciando…
            {:else}
              <LogIn size={16} /> Iniciar sesión
            {/if}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</div>
