<script>
  import { cn } from '$lib/utils.js';
  let { class: className = '', children, for: htmlFor = undefined, ...rest } = $props();
</script>

<label
  for={htmlFor}
  class={cn(
    'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    className
  )}
  {...rest}
>
  {@render children?.()}
</label>
