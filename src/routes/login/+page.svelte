<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiUrls, apiFetch } from '$lib/api';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  onMount(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('jwtToken');
    if (token) {
      goto('/');
    }
  });

  async function handleLogin() {
    error = '';
    loading = true;
    
    try {
      // Use direct fetch for login to see the raw response
      const response = await fetch(ApiUrls.AUTH.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
      
      // Store token and user data - check all possible token field names
      const token = data.token || data.accessToken || data.access_token || data.jwt || data.id_token;
      
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }
      
      // Store the token in localStorage
      localStorage.setItem('jwtToken', token);
      
      // Store user data if available
      if (data.user || data.userData) {
        localStorage.setItem('userData', JSON.stringify(data.user || data.userData));
      }
      
      // Redirect to dashboard
      goto('/');
    } catch (err) {
      error = err.message || 'Error al iniciar sesión. Intente nuevamente.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Avalúos Trochez</h1>
      <p class="text-gray-600">Panel de Administración</p>
    </div>
    
    <form on:submit|preventDefault={handleLogin} class="space-y-6">
      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{error}</span>
        </div>
      {/if}
      
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="correo@ejemplo.com"
        />
      </div>
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  </div>
</div>
