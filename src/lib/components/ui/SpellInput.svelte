<script>
  import { cn, debounce } from '$lib/utils.js';
  import { spell } from '$lib/stores/spell.svelte.js';
  import { Sparkles, X } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import { tick } from 'svelte';

  let {
    value = $bindable(''),
    class: className = '',
    error = false,
    type = 'text',
    minLength = 3,
    ...rest
  } = $props();

  let inputEl;
  let wordStart = 0;
  let wordEnd = 0;
  let dismissedFor = '';
  let suggestion = $state(null);
  let bad = $state('');

  const recompute = debounce(async () => {
    if (!inputEl) return;
    const focused = document.activeElement === inputEl;
    if (!focused) {
      suggestion = null;
      return;
    }
    const caret = inputEl.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const startMatch = before.match(/[\p{L}\p{N}'’]+$/u);
    const endMatch = after.match(/^[\p{L}\p{N}'’]+/u);
    wordStart = startMatch ? caret - startMatch[0].length : caret;
    wordEnd = endMatch ? caret + endMatch[0].length : caret;
    const word = value.slice(wordStart, wordEnd);
    if (!word || word.length < minLength || dismissedFor === word.toLowerCase()) {
      suggestion = null;
      bad = '';
      return;
    }
    if (!spell.ready) await spell.init();
    if (!spell.ready) {
      suggestion = null;
      return;
    }
    if (spell.isKnown(word)) {
      suggestion = null;
      bad = '';
      return;
    }
    const list = spell.suggest(word, 1);
    if (!list.length || list[0].toLowerCase() === word.toLowerCase()) {
      suggestion = null;
      return;
    }
    suggestion = list[0];
    bad = word;
  }, 250);

  function onInput() {
    dismissedFor = '';
    recompute();
  }

  function applySuggestion() {
    if (!suggestion) return;
    // Preserve casing of the original first letter.
    const original = value.slice(wordStart, wordEnd);
    let replacement = suggestion;
    if (original && original[0] === original[0]?.toUpperCase()) {
      replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    if (original === original?.toUpperCase()) replacement = replacement.toUpperCase();
    const next = value.slice(0, wordStart) + replacement + value.slice(wordEnd);
    value = next;
    const newCaret = wordStart + replacement.length;
    suggestion = null;
    bad = '';
    tick().then(() => {
      if (inputEl) {
        inputEl.focus();
        inputEl.setSelectionRange(newCaret, newCaret);
      }
    });
  }

  function dismiss() {
    if (bad) dismissedFor = bad.toLowerCase();
    suggestion = null;
    bad = '';
  }

  function onKeydown(e) {
    if (!suggestion) return;
    if ((e.key === 'Tab' && !e.shiftKey) || (e.key === 'Enter' && e.altKey)) {
      e.preventDefault();
      applySuggestion();
    } else if (e.key === 'Escape') {
      dismiss();
    }
  }

  let classes = $derived(
    cn(
      'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive' : 'border-input',
      className
    )
  );
</script>

<div class="relative">
  <input
    bind:this={inputEl}
    bind:value
    {type}
    spellcheck="true"
    lang="es"
    autocapitalize="sentences"
    autocomplete="off"
    oninput={onInput}
    onkeydown={onKeydown}
    onblur={() => setTimeout(() => (suggestion = null), 120)}
    class={classes}
    {...rest}
  />

  {#if suggestion}
    <div
      class="absolute left-0 top-full z-30 mt-1 flex items-center gap-1.5"
      transition:fly={{ y: -2, duration: 140 }}
    >
      <div class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs shadow-sm backdrop-blur">
        <Sparkles size={12} class="text-primary" />
        <span class="text-muted-foreground">¿Quisiste decir</span>
        <button
          type="button"
          onmousedown={(e) => {
            e.preventDefault();
            applySuggestion();
          }}
          class="font-medium text-primary hover:underline"
        >
          {suggestion}
        </button>
        <span class="text-muted-foreground">?</span>
        <span class="hidden text-[10px] uppercase tracking-wider text-muted-foreground/70 sm:inline">Tab</span>
        <button
          type="button"
          onmousedown={(e) => {
            e.preventDefault();
            dismiss();
          }}
          class="ml-0.5 rounded-full p-0.5 text-muted-foreground/70 hover:bg-muted hover:text-foreground"
          aria-label="Descartar sugerencia"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  {/if}
</div>
