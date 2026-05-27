<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { cn } from '$lib/utils.js';
  import { auth } from '$lib/stores/auth.svelte.js';
  import { LayoutDashboard, FileSpreadsheet, Menu, LogOut, ChevronLeft, X } from 'lucide-svelte';

  let { collapsed = $bindable(false), mobileOpen = $bindable(false) } = $props();

  const nav = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, match: (p) => p === '/' },
    { href: '/avaluos', label: 'Avalúos', icon: FileSpreadsheet, match: (p) => p.startsWith('/avaluos') }
  ];

  function logout() {
    auth.clearSession();
    goto('/login');
  }

  let user = $derived(auth.user);
  let initials = $derived(
    (user?.full_name || user?.username || user?.email || 'U')
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('')
  );
</script>

<!-- Mobile backdrop -->
{#if mobileOpen}
  <button
    type="button"
    class="fixed inset-0 z-30 bg-black/40 md:hidden"
    onclick={() => (mobileOpen = false)}
    aria-label="Cerrar menú"
  ></button>
{/if}

<aside
  class={cn(
    'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200',
    collapsed ? 'md:w-16' : 'md:w-60',
    mobileOpen ? 'w-60 translate-x-0' : '-translate-x-full md:translate-x-0'
  )}
>
  <!-- Floating collapse toggle (desktop only). Sits half-out of the sidebar
       border so it's always visible and never overlaps the header content. -->
  <button
    type="button"
    onclick={() => (collapsed = !collapsed)}
    class={cn(
      'hidden md:flex absolute top-6 -right-3 z-50 h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent transition-transform',
      collapsed && 'rotate-180'
    )}
    aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
    title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
  >
    <ChevronLeft size={14} />
  </button>

  <div class={cn('flex h-14 items-center gap-2 border-b border-sidebar-border', collapsed ? 'px-2 justify-center' : 'px-3 justify-between')}>
    <a
      href="/"
      class="flex items-center gap-2 overflow-hidden"
      aria-label="Avalúos Trochez"
      title="Avalúos Trochez"
    >
      <img
        src="/logo.png"
        alt="Avalúos Trochez"
        class={cn('shrink-0 object-contain transition-all', collapsed ? 'h-9 w-9' : 'h-10 w-10')}
      />
      {#if !collapsed}
        <span class="truncate text-base font-semibold tracking-tight">Trochez</span>
      {/if}
    </a>
    <button
      type="button"
      onclick={() => (mobileOpen = false)}
      class="md:hidden -mr-1 rounded p-1 hover:bg-sidebar-accent"
      aria-label="Cerrar"
    >
      <X size={18} />
    </button>
  </div>

  <nav class="flex-1 overflow-y-auto p-2">
    <ul class="space-y-1">
      {#each nav as item}
        {@const active = item.match($page.url.pathname)}
        <li>
          <a
            href={item.href}
            onclick={() => (mobileOpen = false)}
            class={cn(
              'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
            title={collapsed ? item.label : ''}
          >
            <item.icon size={18} class="shrink-0" />
            {#if !collapsed}
              <span class="truncate">{item.label}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="border-t border-sidebar-border p-3">
    {#if !collapsed}
      <div class="flex items-center gap-3 mb-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {initials}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium">{user?.full_name || user?.username || 'Invitado'}</p>
          {#if user?.email}
            <p class="truncate text-xs text-muted-foreground">{user.email}</p>
          {/if}
        </div>
      </div>
    {/if}
    <button
      type="button"
      onclick={logout}
      class={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
        collapsed && 'justify-center'
      )}
      title="Cerrar sesión"
    >
      <LogOut size={16} class="shrink-0" />
      {#if !collapsed}
        <span>Cerrar sesión</span>
      {/if}
    </button>
  </div>
</aside>
