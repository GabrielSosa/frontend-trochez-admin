import { c as create_ssr_component, v as validate_component } from "../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/state.svelte.js";
import { Chart, registerables } from "chart.js";
import { N as Navbar } from "../../chunks/Navbar.js";
const eventPrefix = /^on/;
const events = [];
Object.keys(globalThis).forEach((key) => {
  if (eventPrefix.test(key)) {
    events.push(key.replace(eventPrefix, ""));
  }
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  Chart.register(...registerables);
  let user = null;
  return `<div class="min-h-screen bg-gray-50"> ${validate_component(Navbar, "Navbar").$$render($$result, { user }, {}, {})}  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><h1 class="text-2xl font-bold text-gray-800 mb-6" data-svelte-h="svelte-m7kkm0">Dashboard</h1> ${`<div class="flex justify-center items-center py-16" data-svelte-h="svelte-17u4hzb"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div> <span class="ml-4 text-gray-500">Cargando dashboard...</span></div>`}</main></div>`;
});
export {
  Page as default
};
