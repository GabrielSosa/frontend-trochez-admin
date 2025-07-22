import { c as create_ssr_component, d as subscribe } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/state.svelte.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_page();
  return `<div class="min-h-screen flex flex-col">${slots.default ? slots.default({}) : ``}</div>`;
});
export {
  Layout as default
};
