<script>
  import { cn } from '$lib/utils.js';
  import { X } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';

  let {
    open = $bindable(false),
    title = '',
    description = '',
    showClose = true,
    class: className = '',
    children,
    footer
  } = $props();

  function close() {
    open = false;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={open ? onKeydown : null} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      transition:fade={{ duration: 150 }}
      onclick={close}
      role="presentation"
    ></div>
    <div
      class={cn(
        'relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg',
        className
      )}
      transition:scale={{ duration: 150, start: 0.96 }}
    >
      {#if showClose}
        <button
          type="button"
          onclick={close}
          class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      {/if}
      {#if title}
        <h2 class="text-lg font-semibold leading-none tracking-tight mb-1">{title}</h2>
      {/if}
      {#if description}
        <p class="text-sm text-muted-foreground mb-4">{description}</p>
      {/if}
      {@render children?.()}
      {#if footer}
        <div class="mt-6 flex justify-end gap-2">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
