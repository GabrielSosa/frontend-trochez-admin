<script>
  import { cn } from '$lib/utils.js';
  import { Check } from 'lucide-svelte';

  let { checked = $bindable(false), indeterminate = false, disabled = false, class: className = '', ...rest } = $props();
</script>

<button
  type="button"
  role="checkbox"
  aria-checked={indeterminate ? 'mixed' : checked}
  {disabled}
  onclick={() => (checked = !checked)}
  class={cn(
    'peer h-4 w-4 shrink-0 rounded border border-input shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    (checked || indeterminate) && 'bg-primary border-primary text-primary-foreground',
    className
  )}
  {...rest}
>
  {#if checked && !indeterminate}
    <Check class="h-3.5 w-3.5" strokeWidth={3} />
  {:else if indeterminate}
    <span class="block h-0.5 w-2 mx-auto bg-primary-foreground"></span>
  {/if}
</button>
