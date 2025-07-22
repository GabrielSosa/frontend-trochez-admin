

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/login/+page.js";
export const imports = ["_app/immutable/nodes/6.C-FYi6P1.js","_app/immutable/chunks/DH0NG5GU.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DNYyVYut.js","_app/immutable/chunks/bK7qKMo_.js"];
export const stylesheets = [];
export const fonts = [];
