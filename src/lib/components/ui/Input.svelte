<script>
  import { cn } from '$lib/utils.js';

  let {
    value = $bindable(''),
    type = 'text',
    class: className = '',
    error = false,
    spellcheck,
    lang,
    autocapitalize,
    autocomplete,
    ...rest
  } = $props();

  // Spanish spellcheck on by default for free-text inputs (`text`, `search`,
  // `email`, `url`, `textarea`-like). Numeric, password, date, etc. opt out.
  const textLike = ['text', 'search', 'email', 'url', 'tel', undefined].includes(type);
  let spellcheckAttr = $derived(spellcheck ?? (textLike ? 'true' : 'false'));
  let langAttr = $derived(lang ?? (textLike ? 'es' : undefined));
  let autocapitalizeAttr = $derived(autocapitalize ?? (textLike ? 'sentences' : undefined));
  let autocompleteAttr = $derived(autocomplete ?? (textLike ? 'on' : undefined));

  let classes = $derived(
    cn(
      'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive' : 'border-input',
      className
    )
  );
</script>

{#if type === 'number'}
  <input
    type="number"
    bind:value
    spellcheck="false"
    class={classes}
    {...rest}
  />
{:else}
  <input
    {type}
    bind:value
    spellcheck={spellcheckAttr}
    lang={langAttr}
    autocapitalize={autocapitalizeAttr}
    autocomplete={autocompleteAttr}
    class={classes}
    {...rest}
  />
{/if}
