
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/avaluos" | "/avaluos/nuevo" | "/avaluos/[id]" | "/avaluos/[id]/editar" | "/login";
		RouteParams(): {
			"/avaluos/[id]": { id: string };
			"/avaluos/[id]/editar": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/avaluos": { id?: string };
			"/avaluos/nuevo": Record<string, never>;
			"/avaluos/[id]": { id: string };
			"/avaluos/[id]/editar": { id: string };
			"/login": Record<string, never>
		};
		Pathname(): "/" | "/avaluos" | "/avaluos/" | "/avaluos/nuevo" | "/avaluos/nuevo/" | `/avaluos/${string}` & {} | `/avaluos/${string}/` & {} | `/avaluos/${string}/editar` & {} | `/avaluos/${string}/editar/` & {} | "/login" | "/login/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/.DS_Store" | "/favicon.png" | "/images/favicon.png" | "/images/logo.png" | string & {};
	}
}