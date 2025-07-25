

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/login/+page.js";
export const imports = ["_app/immutable/nodes/6.w6dSa4nD.js","_app/immutable/chunks/CnbjcvQe.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DA3rruqa.js","_app/immutable/chunks/BDh5lRBQ.js"];
export const stylesheets = [];
export const fonts = [];
