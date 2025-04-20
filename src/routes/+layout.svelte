<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // Check authentication on protected routes
  onMount(() => {
    const token = localStorage.getItem('jwtToken');
    const isLoginPage = $page.url.pathname === '/login';
    
    if (!token && !isLoginPage) {
      goto('/login');
    }
  });
</script>

<div class="min-h-screen flex flex-col">
  <slot />
</div>
