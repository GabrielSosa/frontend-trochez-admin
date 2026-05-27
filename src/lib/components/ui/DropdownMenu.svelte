<script>
  import { cn } from '$lib/utils.js';
  import { onMount } from 'svelte';

  let { class: className = '', align = 'end', trigger, children } = $props();

  let open = $state(false);
  let menuEl;
  let triggerEl;

  function toggle(e) {
    e.stopPropagation();
    open = !open;
  }

  function handleDocClick(e) {
    if (!open) return;
    if (menuEl && !menuEl.contains(e.target) && triggerEl && !triggerEl.contains(e.target)) {
      open = false;
    }
  }

  function handleKey(e) {
    if (e.key === 'Escape') open = false;
  }

  onMount(() => {
    document.addEventListener('click', handleDocClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  });

  // Close menu when an item inside is clicked
  function onItemContainerClick(e) {
    const item = e.target.closest('[data-menu-item]');
    if (item) open = false;
  }
</script>

<div class="relative inline-block text-left" bind:this={triggerEl}>
  <div onclick={toggle} role="button" tabindex="0">
    {@render trigger()}
  </div>
  {#if open}
    <div
      bind:this={menuEl}
      onclick={onItemContainerClick}
      role="menu"
      class={cn(
        'absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
    >
      {@render children?.()}
    </div>
  {/if}
</div>
