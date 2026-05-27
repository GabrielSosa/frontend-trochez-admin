<script>
  import { cn } from '$lib/utils.js';

  let {
    value = $bindable(''),
    type = 'text',
    class: className = '',
    error = false,
    ...rest
  } = $props();
</script>

{#if type === 'number'}
  <input
    type="number"
    bind:value
    class={cn(
      'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive' : 'border-input',
      className
    )}
    {...rest}
  />
{:else}
  <input
    {type}
    bind:value
    class={cn(
      'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive' : 'border-input',
      className
    )}
    {...rest}
  />
{/if}
