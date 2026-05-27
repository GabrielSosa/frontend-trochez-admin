<script>
  import { cn, debounce } from '$lib/utils.js';
  import { spell } from '$lib/stores/spell.svelte.js';
  import { Sparkles, X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { tick } from 'svelte';

  let {
    value = $bindable(''),
    class: className = '',
    error = false,
    minLength = 3,
    ...rest
  } = $props();

  let textareaEl;
  let overlayEl;
  let wordStart = 0;
  let wordEnd = 0;
  let dismissedFor = $state(new Set());
  let suggestion = $state(null);
  let bad = $state('');
  let spellTick = $state(0);

  let tokens = $derived.by(() => {
    spellTick;
    const out = [];
    const re = /[\p{L}\p{N}'’]+|[^\p{L}\p{N}'’]+/gu;
    let m;
    while ((m = re.exec(value)) !== null) {
      const t = m[0];
      const isWord = /^[\p{L}\p{N}'’]+/u.test(t);
      out.push({
        text: t,
        bad: isWord && spell.ready ? !spell.isKnown(t) : false
      });
    }
    return out;
  });

  function refreshOverlay() {
    spellTick++;
  }

  const checkCaret = debounce(async () => {
    if (!textareaEl) return;
    if (document.activeElement !== textareaEl) {
      suggestion = null;
      return;
    }
    const caret = textareaEl.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const startMatch = before.match(/[\p{L}\p{N}'’]+$/u);
    const endMatch = after.match(/^[\p{L}\p{N}'’]+/u);
    wordStart = startMatch ? caret - startMatch[0].length : caret;
    wordEnd = endMatch ? caret + endMatch[0].length : caret;
    const word = value.slice(wordStart, wordEnd);
    if (!word || word.length < minLength || dismissedFor.has(word.toLowerCase())) {
      suggestion = null;
      return;
    }
    if (!spell.ready) {
      await spell.init();
      refreshOverlay();
    }
    if (!spell.ready || spell.isKnown(word)) {
      suggestion = null;
      return;
    }
    const list = spell.suggest(word, 1);
    if (!list.length || list[0].toLowerCase() === word.toLowerCase()) {
      suggestion = null;
      return;
    }
    suggestion = list[0];
    bad = word;
  }, 180);

  function applySuggestion() {
    if (!suggestion) return;
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
      if (textareaEl) {
        textareaEl.focus();
        textareaEl.setSelectionRange(newCaret, newCaret);
      }
    });
  }

  function dismiss() {
    if (bad) {
      const next = new Set(dismissedFor);
      next.add(bad.toLowerCase());
      dismissedFor = next;
    }
    suggestion = null;
    bad = '';
  }

  function onInput() {
    dismissedFor = new Set();
    checkCaret();
  }

  function onKeydown(e) {
    if (suggestion) {
      if ((e.key === 'Tab' && !e.shiftKey) || (e.key === 'Enter' && e.altKey)) {
        e.preventDefault();
        applySuggestion();
        return;
      }
      if (e.key === 'Escape') {
        dismiss();
        return;
      }
    }
  }

  function syncScroll() {
    if (textareaEl && overlayEl) {
      overlayEl.scrollLeft = textareaEl.scrollLeft;
      overlayEl.scrollTop = textareaEl.scrollTop;
    }
  }

  function ensureSpellReady() {
    if (!spell.ready && !spell.loading) {
      spell.init().then(refreshOverlay);
    }
  }

  let classes = $derived(
    cn(
      'spell-input flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
      error ? 'border-destructive' : 'border-input',
      className
    )
  );
</script>

<div class="relative">
  <div bind:this={overlayEl} class={cn(classes, 'spell-overlay')} aria-hidden="true">
    {#each tokens as tk, i (i)}
      {#if tk.bad}<span class="spell-bad">{tk.text}</span>{:else}<span>{tk.text}</span>{/if}
    {/each}
  </div>
  <textarea
    bind:this={textareaEl}
    bind:value
    spellcheck="false"
    lang="es"
    autocapitalize="sentences"
    autocomplete="on"
    oninput={onInput}
    onkeydown={onKeydown}
    onkeyup={() => checkCaret()}
    onclick={() => {
      ensureSpellReady();
      checkCaret();
    }}
    onfocus={() => {
      ensureSpellReady();
      checkCaret();
    }}
    onscroll={syncScroll}
    onblur={() => setTimeout(() => (suggestion = null), 140)}
    class={cn(classes, 'spell-input-field')}
    {...rest}
  ></textarea>

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

<style>
  .spell-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    color: transparent;
    background: transparent;
    border-color: transparent !important;
    box-shadow: none !important;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .spell-input-field {
    position: relative;
    background: transparent !important;
    resize: vertical;
  }
  :global(.spell-bad) {
    text-decoration: underline wavy hsl(0 72% 51% / 0.95);
    text-decoration-thickness: 1.5px;
    text-underline-offset: 3px;
    color: transparent;
  }
</style>
