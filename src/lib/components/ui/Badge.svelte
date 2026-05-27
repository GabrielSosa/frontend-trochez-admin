<script>
  import { cn } from '$lib/utils.js';

  let { variant = 'default', class: className = '', children, ...rest } = $props();

  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    outline: 'text-foreground',
    success: 'border-transparent bg-emerald-100 text-emerald-700'
  };
</script>

<span
  class={cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variants[variant],
    className
  )}
  {...rest}
>
  {@render children?.()}
</span>
