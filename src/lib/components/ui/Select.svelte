<script>
  import { cn } from '$lib/utils.js';

  let {
    value = $bindable(''),
    options = [],
    placeholder = 'Seleccionar...',
    class: className = '',
    error = false,
    ...rest
  } = $props();
</script>

<select
  bind:value
  class={cn(
    'flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    error ? 'border-destructive' : 'border-input',
    className
  )}
  {...rest}
>
  {#if placeholder}
    <option value="" disabled hidden>{placeholder}</option>
  {/if}
  {#each options as opt (opt.value ?? opt)}
    {@const v = opt.value ?? opt}
    {@const l = opt.label ?? opt}
    <option value={v}>{l}</option>
  {/each}
</select>
