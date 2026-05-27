<script>
  import { onMount } from 'svelte';
  import { setConfirmHandler } from '$lib/utils/confirm.js';
  import Dialog from '$lib/components/ui/Dialog.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let open = $state(false);
  let opts = $state({ title: '', message: '', confirmText: 'Confirmar', cancelText: 'Cancelar', variant: 'default' });
  let resolver = null;

  function handle(o) {
    opts = { ...opts, ...o };
    open = true;
    return new Promise((resolve) => {
      resolver = resolve;
    });
  }

  function confirm() {
    open = false;
    resolver?.(true);
    resolver = null;
  }

  function cancel() {
    open = false;
    resolver?.(false);
    resolver = null;
  }

  onMount(() => setConfirmHandler(handle));
</script>

<Dialog bind:open title={opts.title} description={opts.message}>
  <div class="flex justify-end gap-2 mt-6">
    <Button variant="outline" onclick={cancel}>{opts.cancelText}</Button>
    <Button variant={opts.variant === 'destructive' ? 'destructive' : 'default'} onclick={confirm}>
      {opts.confirmText}
    </Button>
  </div>
</Dialog>
