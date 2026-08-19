
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
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(dashboard)" | "/(auth)" | "/" | "/(dashboard)/analitik" | "/(dashboard)/attendance" | "/(dashboard)/candidates" | "/(dashboard)/children" | "/(dashboard)/dashboard" | "/(dashboard)/invoices" | "/(dashboard)/jobboard" | "/(dashboard)/jobs" | "/(dashboard)/laporan" | "/(dashboard)/levels" | "/(auth)/login" | "/(dashboard)/packages" | "/(dashboard)/payroll" | "/(dashboard)/profile" | "/(dashboard)/program" | "/(dashboard)/reports" | "/(dashboard)/students" | "/(dashboard)/subjects" | "/(dashboard)/users";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/(dashboard)": Record<string, never>;
			"/(auth)": Record<string, never>;
			"/": Record<string, never>;
			"/(dashboard)/analitik": Record<string, never>;
			"/(dashboard)/attendance": Record<string, never>;
			"/(dashboard)/candidates": Record<string, never>;
			"/(dashboard)/children": Record<string, never>;
			"/(dashboard)/dashboard": Record<string, never>;
			"/(dashboard)/invoices": Record<string, never>;
			"/(dashboard)/jobboard": Record<string, never>;
			"/(dashboard)/jobs": Record<string, never>;
			"/(dashboard)/laporan": Record<string, never>;
			"/(dashboard)/levels": Record<string, never>;
			"/(auth)/login": Record<string, never>;
			"/(dashboard)/packages": Record<string, never>;
			"/(dashboard)/payroll": Record<string, never>;
			"/(dashboard)/profile": Record<string, never>;
			"/(dashboard)/program": Record<string, never>;
			"/(dashboard)/reports": Record<string, never>;
			"/(dashboard)/students": Record<string, never>;
			"/(dashboard)/subjects": Record<string, never>;
			"/(dashboard)/users": Record<string, never>
		};
		Pathname(): "/" | "/analitik" | "/attendance" | "/candidates" | "/children" | "/dashboard" | "/invoices" | "/jobboard" | "/jobs" | "/laporan" | "/levels" | "/login" | "/packages" | "/payroll" | "/profile" | "/program" | "/reports" | "/students" | "/subjects" | "/users";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/logo-sentraedu.jpg" | string & {};
	}
}