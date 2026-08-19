
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
		RouteId(): "/(dashboard)" | "/(auth)" | "/" | "/(dashboard)/admin" | "/(dashboard)/admin/analitik" | "/(dashboard)/admin/attendance" | "/(dashboard)/admin/candidates" | "/(dashboard)/admin/invoices" | "/(dashboard)/admin/jobs" | "/(dashboard)/admin/laporan" | "/(dashboard)/admin/levels" | "/(dashboard)/admin/magic-links" | "/(dashboard)/admin/packages" | "/(dashboard)/admin/payroll" | "/(dashboard)/admin/profile" | "/(dashboard)/admin/students" | "/(dashboard)/admin/students/wali" | "/(dashboard)/admin/subjects" | "/(dashboard)/admin/tentors" | "/(dashboard)/admin/tentors/magic-links" | "/(dashboard)/admin/users" | "/(dashboard)/analitik" | "/(dashboard)/attendance" | "/(dashboard)/candidates" | "/(dashboard)/children" | "/(dashboard)/dashboard" | "/(dashboard)/invoices" | "/(dashboard)/jobboard" | "/(dashboard)/jobs" | "/(dashboard)/laporan" | "/(dashboard)/levels" | "/(auth)/login" | "/(dashboard)/magic-links" | "/(dashboard)/packages" | "/(dashboard)/payroll" | "/(dashboard)/profile" | "/(dashboard)/program" | "/(auth)/register-tentor" | "/(auth)/register" | "/(dashboard)/reports" | "/(dashboard)/students" | "/(dashboard)/students/wali" | "/(dashboard)/student" | "/(dashboard)/student/attendance" | "/(dashboard)/student/profile" | "/(dashboard)/student/program" | "/(dashboard)/student/reports" | "/(dashboard)/subjects" | "/(dashboard)/tentors" | "/(dashboard)/tentors/magic-links" | "/(dashboard)/tentor" | "/(dashboard)/tentor/attendance" | "/(dashboard)/tentor/jobboard" | "/(dashboard)/tentor/payroll" | "/(dashboard)/tentor/profile" | "/(dashboard)/users" | "/(dashboard)/wali" | "/(dashboard)/wali/attendance" | "/(dashboard)/wali/children" | "/(dashboard)/wali/invoices" | "/(dashboard)/wali/profile" | "/(dashboard)/wali/reports";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/(dashboard)": Record<string, never>;
			"/(auth)": Record<string, never>;
			"/": Record<string, never>;
			"/(dashboard)/admin": Record<string, never>;
			"/(dashboard)/admin/analitik": Record<string, never>;
			"/(dashboard)/admin/attendance": Record<string, never>;
			"/(dashboard)/admin/candidates": Record<string, never>;
			"/(dashboard)/admin/invoices": Record<string, never>;
			"/(dashboard)/admin/jobs": Record<string, never>;
			"/(dashboard)/admin/laporan": Record<string, never>;
			"/(dashboard)/admin/levels": Record<string, never>;
			"/(dashboard)/admin/magic-links": Record<string, never>;
			"/(dashboard)/admin/packages": Record<string, never>;
			"/(dashboard)/admin/payroll": Record<string, never>;
			"/(dashboard)/admin/profile": Record<string, never>;
			"/(dashboard)/admin/students": Record<string, never>;
			"/(dashboard)/admin/students/wali": Record<string, never>;
			"/(dashboard)/admin/subjects": Record<string, never>;
			"/(dashboard)/admin/tentors": Record<string, never>;
			"/(dashboard)/admin/tentors/magic-links": Record<string, never>;
			"/(dashboard)/admin/users": Record<string, never>;
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
			"/(dashboard)/magic-links": Record<string, never>;
			"/(dashboard)/packages": Record<string, never>;
			"/(dashboard)/payroll": Record<string, never>;
			"/(dashboard)/profile": Record<string, never>;
			"/(dashboard)/program": Record<string, never>;
			"/(auth)/register-tentor": Record<string, never>;
			"/(auth)/register": Record<string, never>;
			"/(dashboard)/reports": Record<string, never>;
			"/(dashboard)/students": Record<string, never>;
			"/(dashboard)/students/wali": Record<string, never>;
			"/(dashboard)/student": Record<string, never>;
			"/(dashboard)/student/attendance": Record<string, never>;
			"/(dashboard)/student/profile": Record<string, never>;
			"/(dashboard)/student/program": Record<string, never>;
			"/(dashboard)/student/reports": Record<string, never>;
			"/(dashboard)/subjects": Record<string, never>;
			"/(dashboard)/tentors": Record<string, never>;
			"/(dashboard)/tentors/magic-links": Record<string, never>;
			"/(dashboard)/tentor": Record<string, never>;
			"/(dashboard)/tentor/attendance": Record<string, never>;
			"/(dashboard)/tentor/jobboard": Record<string, never>;
			"/(dashboard)/tentor/payroll": Record<string, never>;
			"/(dashboard)/tentor/profile": Record<string, never>;
			"/(dashboard)/users": Record<string, never>;
			"/(dashboard)/wali": Record<string, never>;
			"/(dashboard)/wali/attendance": Record<string, never>;
			"/(dashboard)/wali/children": Record<string, never>;
			"/(dashboard)/wali/invoices": Record<string, never>;
			"/(dashboard)/wali/profile": Record<string, never>;
			"/(dashboard)/wali/reports": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/analitik" | "/admin/attendance" | "/admin/candidates" | "/admin/invoices" | "/admin/jobs" | "/admin/laporan" | "/admin/levels" | "/admin/magic-links" | "/admin/packages" | "/admin/payroll" | "/admin/profile" | "/admin/students" | "/admin/students/wali" | "/admin/subjects" | "/admin/tentors" | "/admin/tentors/magic-links" | "/admin/users" | "/analitik" | "/attendance" | "/candidates" | "/children" | "/dashboard" | "/invoices" | "/jobboard" | "/jobs" | "/laporan" | "/levels" | "/login" | "/magic-links" | "/packages" | "/payroll" | "/profile" | "/program" | "/register-tentor" | "/register" | "/reports" | "/students" | "/students/wali" | "/student" | "/student/attendance" | "/student/profile" | "/student/program" | "/student/reports" | "/subjects" | "/tentors" | "/tentors/magic-links" | "/tentor" | "/tentor/attendance" | "/tentor/jobboard" | "/tentor/payroll" | "/tentor/profile" | "/users" | "/wali" | "/wali/attendance" | "/wali/children" | "/wali/invoices" | "/wali/profile" | "/wali/reports";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/logo-sentraedu.jpg" | string & {};
	}
}