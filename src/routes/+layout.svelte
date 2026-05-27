<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Toaster } from 'svelte-sonner';
  import AppSidebar from '$lib/components/AppSidebar.svelte';
  import ConfirmHost from '$lib/components/ConfirmHost.svelte';
  import { Menu } from 'lucide-svelte';
  import { auth } from '$lib/stores/auth.svelte.js';

  let { children } = $props();

  let collapsed = $state(false);
  let mobileOpen = $state(false);

  let isLoginPage = $derived($page.url.pathname === '/login');

  onMount(() => {
    // Persist collapsed state per browser
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === '1') collapsed = true;
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
    }
  });

  onMount(() => {
    if (!auth.isAuthenticated && !isLoginPage) {
      goto('/login');
    }
  });
</script>

<Toaster richColors closeButton position="top-right" />
<ConfirmHost />

{#if isLoginPage}
  {@render children?.()}
{:else}
  <div class="min-h-screen bg-background">
    <AppSidebar bind:collapsed bind:mobileOpen />

    <div
      class="flex min-h-screen flex-col transition-[margin] duration-200"
      style:margin-left={collapsed ? 'var(--sb-collapsed)' : 'var(--sb-expanded)'}
    >
      <!-- Mobile topbar -->
      <header class="md:hidden flex h-14 items-center gap-3 border-b bg-background px-4">
        <button
          type="button"
          onclick={() => (mobileOpen = true)}
          class="rounded-md p-2 hover:bg-accent"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <span class="font-semibold tracking-tight">Trochez</span>
      </header>

      <main class="flex-1 px-4 py-6 md:px-8 md:py-8">
        {@render children?.()}
      </main>
    </div>
  </div>
{/if}

<style>
  :global(:root) {
    --sb-expanded: 15rem;
    --sb-collapsed: 4rem;
  }
  @media (max-width: 767px) {
    :global(:root) {
      --sb-expanded: 0px;
      --sb-collapsed: 0px;
    }
  }
</style>
