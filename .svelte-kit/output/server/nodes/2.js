

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.CMQwl0K7.js","_app/immutable/chunks/CnbjcvQe.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CZYdmkq_.js","_app/immutable/chunks/Dp1kotmo.js","_app/immutable/chunks/DiJChxwk.js","_app/immutable/chunks/BDh5lRBQ.js"];
export const stylesheets = [];
export const fonts = [];
