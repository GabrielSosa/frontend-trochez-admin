<script>
  import { cn, debounce } from '$lib/utils.js';
  import { spell } from '$lib/stores/spell.svelte.js';
  import { tick } from 'svelte';

  let {
    value = $bindable(''),
    class: className = '',
    error = false,
    type = 'text',
    /** Override spell text-case detection. */
    uppercase = false,
    minLength = 2,
    maxSuggestions = 6,
    ...rest
  } = $props();

  let inputEl;
  let open = $state(false);
  let suggestions = $state([]);
  let active = $state(0);
  let currentWordStart = 0;
  let currentWordEnd = 0;
  let blurTimer;

  const recompute = debounce(async () => {
    if (!inputEl || document.activeElement !== inputEl) {
      open = false;
      return;
    }
    const caret = inputEl.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const startMatch = before.match(/[\p{L}\p{N}'’]+$/u);
    const endMatch = after.match(/^[\p{L}\p{N}'’]+/u);
    currentWordStart = startMatch ? caret - startMatch[0].length : caret;
    currentWordEnd = endMatch ? caret + endMatch[0].length : caret;
    const word = value.slice(currentWordStart, currentWordEnd);
    if (!word || word.length < minLength) {
      open = false;
      return;
    }
    if (!spell.ready) await spell.init();
    if (!spell.ready) {
      open = false;
      return;
    }
    const list = spell.complete(word, maxSuggestions);
    suggestions = list.filter((s) => s.toLowerCase() !== word.toLowerCase());
    active = 0;
    open = suggestions.length > 0;
  }, 180);

  function onInput() {
    recompute();
  }

  function onKeydown(e) {
    if (!open) {
      if (e.key === 'Escape') recompute.cancel?.();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = (active + 1) % suggestions.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (suggestions[active]) {
        e.preventDefault();
        applySuggestion(suggestions[active]);
      }
    } else if (e.key === 'Escape') {
      open = false;
    }
  }

  function applySuggestion(word) {
    let replacement = word;
    if (uppercase) replacement = replacement.toUpperCase();
    else {
      // Preserve case of the original first letter where it makes sense.
      const original = value.slice(currentWordStart, currentWordEnd);
      if (original && original[0] && original[0] === original[0].toUpperCase()) {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
    }
    const next = value.slice(0, currentWordStart) + replacement + value.slice(currentWordEnd);
    value = next;
    open = false;
    suggestions = [];
    // Restore caret after the inserted word.
    const newCaret = currentWordStart + replacement.length;
    tick().then(() => {
      if (inputEl) {
        inputEl.focus();
        inputEl.setSelectionRange(newCaret, newCaret);
      }
    });
  }

  function onFocus() {
    if (blurTimer) clearTimeout(blurTimer);
    recompute();
  }

  function onBlur() {
    // Defer so a mousedown on a suggestion gets a chance to fire first.
    blurTimer = setTimeout(() => {
      open = false;
    }, 120);
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
    onfocus={onFocus}
    onblur={onBlur}
    class={classes}
    {...rest}
  />
  {#if open && suggestions.length}
    <ul
      class="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md"
      role="listbox"
    >
      {#each suggestions as s, i (s)}
        <li>
          <button
            type="button"
            role="option"
            aria-selected={i === active}
            onmousedown={(e) => {
              e.preventDefault();
              applySuggestion(s);
            }}
            onmouseenter={() => (active = i)}
            class={cn(
              'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
              i === active ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/60'
            )}
          >
            <span>{s}</span>
            {#if i === active}
              <span class="text-[10px] uppercase text-muted-foreground">Tab/Enter</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
