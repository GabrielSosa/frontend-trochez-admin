// Admin panel — no SEO, no public landing — so we skip SSR entirely.
// The browser still renders the SvelteKit app, just on the client; Vercel
// serves a tiny static shell instead of running the framework on every
// navigation. Trims ~50–150 ms per page and cuts function invocations.
export const ssr = false;

// CSR is on by default (it has to be: we have interactive components).
// `trailingSlash` left at SvelteKit's default.
