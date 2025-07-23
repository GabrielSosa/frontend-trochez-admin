

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.D8X7oiKp.js","_app/immutable/chunks/CnbjcvQe.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Brl5YFAa.js","_app/immutable/chunks/BKELNo4D.js","_app/immutable/chunks/sBQDK4gc.js","_app/immutable/chunks/BDh5lRBQ.js"];
export const stylesheets = [];
export const fonts = [];
