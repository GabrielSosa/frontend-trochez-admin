<script>
  import { cn } from '$lib/utils.js';
  import { Loader2 } from 'lucide-svelte';
  let { class: className = '', size = 16 } = $props();
</script>

<Loader2 class={cn('animate-spin text-muted-foreground', className)} {size} />
