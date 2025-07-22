import { c as create_ssr_component, d as subscribe, v as validate_component, e as escape } from "../../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/state.svelte.js";
import { p as page } from "../../../../../chunks/stores.js";
import { N as Navbar } from "../../../../../chunks/Navbar.js";
import { g as getDefaultAvaluoFormData } from "../../../../../chunks/avaluoUtils.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let avaluoId = $page.params.id;
  let user = null;
  getDefaultAvaluoFormData();
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="min-h-screen bg-gray-50">${validate_component(Navbar, "Navbar").$$render($$result, { user }, {}, {})} <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="flex justify-between items-center mb-6"><h1 class="text-2xl font-bold text-gray-800">Editar Avalúo #${escape(avaluoId)}</h1> </div> ${`<div class="text-center py-10" data-svelte-h="svelte-gztuae"><p class="text-gray-500">Cargando datos del avalúo...</p> </div>`}</main></div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
