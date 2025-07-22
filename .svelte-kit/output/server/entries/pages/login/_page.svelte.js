import { c as create_ssr_component, g as add_attribute, e as escape } from "../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  return `<div class="min-h-screen flex items-center justify-center bg-gray-100"><div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md"><div class="text-center mb-8" data-svelte-h="svelte-1urdbpm"><h1 class="text-2xl font-bold text-gray-800">Avalúos Trochez</h1> <p class="text-gray-600">Panel de Administración</p></div> <form class="space-y-6">${``} <div><label for="email" class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-9oeeyk">Correo Electrónico</label> <input id="email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="correo@ejemplo.com"${add_attribute("value", email, 0)}></div> <div><label for="password" class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-1isxpbj">Contraseña</label> <input id="password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••"${add_attribute("value", password, 0)}></div> <button type="submit" ${""} class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">${escape("Iniciar Sesión")}</button></form></div></div>`;
});
export {
  Page as default
};
