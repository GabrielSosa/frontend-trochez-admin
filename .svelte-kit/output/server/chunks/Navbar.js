import { c as create_ssr_component, d as subscribe, h as each, e as escape, f as add_attribute } from "./ssr.js";
import { p as page } from "./stores.js";
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { user = null } = $$props;
  const navItems = [{ name: "Inicio", path: "/" }, { name: "Avalúos", path: "/avaluos" }];
  function isActive(path) {
    return $page.url.pathname === path;
  }
  if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);
  $$unsubscribe_page();
  return `<nav class="bg-white shadow-md"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between h-16"><div class="flex items-center"> <div class="flex-shrink-0 flex items-center" data-svelte-h="svelte-1crkqxg"><img src="/images/logo.png" alt="Avalúos Trochez Logo" class="h-10 w-auto"> <span class="ml-2 text-lg font-semibold text-gray-800">Avalúos Trochez</span></div>  <div class="hidden md:ml-6 md:flex md:space-x-4">${each(navItems, (item) => {
    return `<a${add_attribute("href", item.path, 0)} class="${"px-3 py-2 rounded-md text-sm font-medium " + escape(
      isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      true
    )}">${escape(item.name)} </a>`;
  })}</div></div> <div class="flex items-center"> <div class="flex items-center gap-4"><span class="text-gray-600">Bienvenido, ${escape(user?.name || "Usuario")}</span> <button class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors" data-svelte-h="svelte-g35l1d">Cerrar Sesión</button></div></div></div></div>  <div class="md:hidden"><div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">${each(navItems, (item) => {
    return `<a${add_attribute("href", item.path, 0)} class="${"block px-3 py-2 rounded-md text-base font-medium " + escape(
      isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      true
    )}">${escape(item.name)} </a>`;
  })}</div></div></nav>`;
});
export {
  Navbar as N
};
