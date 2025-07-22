

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.Bil8ZSEE.js","_app/immutable/chunks/CUogZUru.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Czek2359.js","_app/immutable/chunks/Cm5bl9T-.js","_app/immutable/chunks/CUwM8AgA.js"];
export const stylesheets = [];
export const fonts = [];
