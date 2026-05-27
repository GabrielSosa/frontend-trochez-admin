<script>
  import { cn } from '$lib/utils.js';

  let {
    onclick = () => {},
    href = null,
    disabled = false,
    destructive = false,
    class: className = '',
    children,
    ...rest
  } = $props();

  const base =
    'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
</script>

{#if href}
  <a {href} class={cn(base, destructive && 'text-destructive hover:text-destructive', className)} data-menu-item {...rest}>
    {@render children?.()}
  </a>
{:else}
  <button
    type="button"
    {onclick}
    {disabled}
    data-menu-item
    class={cn(base, destructive && 'text-destructive hover:text-destructive', className)}
    {...rest}
  >
    {@render children?.()}
  </button>
{/if}
