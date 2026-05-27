<script>
  import { cn } from '$lib/utils.js';

  let { value = $bindable(''), class: className = '', error = false, ...rest } = $props();
</script>

<textarea
  bind:value
  class={cn(
    'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    error ? 'border-destructive' : 'border-input',
    className
  )}
  {...rest}
></textarea>
