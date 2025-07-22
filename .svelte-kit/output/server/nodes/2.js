

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.D6cY6Yen.js","_app/immutable/chunks/DH0NG5GU.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/B9hiGY2_.js","_app/immutable/chunks/CPX_CQGk.js","_app/immutable/chunks/DsLxeXaI.js"];
export const stylesheets = [];
export const fonts = [];
