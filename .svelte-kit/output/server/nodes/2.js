

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.griTeP7L.js","_app/immutable/chunks/DH0NG5GU.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DNYyVYut.js","_app/immutable/chunks/BPW1MbWz.js","_app/immutable/chunks/B8CSzWin.js"];
export const stylesheets = [];
export const fonts = [];
