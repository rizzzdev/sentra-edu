
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
		RouteId(): "/(tutor)" | "/(student)" | "/(parent)" | "/(auth)" | "/(admin)" | "/" | "/(admin)/admin" | "/(admin)/admin/analytics" | "/(admin)/admin/attendance" | "/(admin)/admin/candidates" | "/(admin)/admin/classes" | "/(admin)/admin/invoices" | "/(admin)/admin/jobs" | "/(admin)/admin/levels" | "/(admin)/admin/magic-links" | "/(admin)/admin/packages" | "/(admin)/admin/payroll" | "/(admin)/admin/profile" | "/(admin)/admin/reports-admin" | "/(admin)/admin/students" | "/(admin)/admin/students/parent" | "/(admin)/admin/subjects" | "/(admin)/admin/tutors" | "/(admin)/admin/tutors/magic-links" | "/(admin)/admin/users" | "/api" | "/api/attendances" | "/api/auth" | "/api/auth/login" | "/api/auth/logout" | "/api/auth/session" | "/api/candidates" | "/api/classes" | "/api/db" | "/api/education-levels" | "/api/enrollments" | "/api/geocode" | "/api/invoices" | "/api/jobs" | "/api/magic-links" | "/api/packages" | "/api/payroll" | "/api/subjects" | "/api/users" | "/(auth)/login" | "/(parent)/parent" | "/(parent)/parent/attendance" | "/(parent)/parent/children" | "/(parent)/parent/invoices" | "/(parent)/parent/profile" | "/(parent)/parent/reports" | "/(auth)/register-tutor" | "/(auth)/register" | "/(student)/student" | "/(student)/student/attendance" | "/(student)/student/profile" | "/(student)/student/program" | "/(student)/student/reports" | "/(tutor)/tutor" | "/(tutor)/tutor/attendance" | "/(tutor)/tutor/jobboard" | "/(tutor)/tutor/payroll" | "/(tutor)/tutor/profile";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/(tutor)": Record<string, never>;
			"/(student)": Record<string, never>;
			"/(parent)": Record<string, never>;
			"/(auth)": Record<string, never>;
			"/(admin)": Record<string, never>;
			"/": Record<string, never>;
			"/(admin)/admin": Record<string, never>;
			"/(admin)/admin/analytics": Record<string, never>;
			"/(admin)/admin/attendance": Record<string, never>;
			"/(admin)/admin/candidates": Record<string, never>;
			"/(admin)/admin/classes": Record<string, never>;
			"/(admin)/admin/invoices": Record<string, never>;
			"/(admin)/admin/jobs": Record<string, never>;
			"/(admin)/admin/levels": Record<string, never>;
			"/(admin)/admin/magic-links": Record<string, never>;
			"/(admin)/admin/packages": Record<string, never>;
			"/(admin)/admin/payroll": Record<string, never>;
			"/(admin)/admin/profile": Record<string, never>;
			"/(admin)/admin/reports-admin": Record<string, never>;
			"/(admin)/admin/students": Record<string, never>;
			"/(admin)/admin/students/parent": Record<string, never>;
			"/(admin)/admin/subjects": Record<string, never>;
			"/(admin)/admin/tutors": Record<string, never>;
			"/(admin)/admin/tutors/magic-links": Record<string, never>;
			"/(admin)/admin/users": Record<string, never>;
			"/api": Record<string, never>;
			"/api/attendances": Record<string, never>;
			"/api/auth": Record<string, never>;
			"/api/auth/login": Record<string, never>;
			"/api/auth/logout": Record<string, never>;
			"/api/auth/session": Record<string, never>;
			"/api/candidates": Record<string, never>;
			"/api/classes": Record<string, never>;
			"/api/db": Record<string, never>;
			"/api/education-levels": Record<string, never>;
			"/api/enrollments": Record<string, never>;
			"/api/geocode": Record<string, never>;
			"/api/invoices": Record<string, never>;
			"/api/jobs": Record<string, never>;
			"/api/magic-links": Record<string, never>;
			"/api/packages": Record<string, never>;
			"/api/payroll": Record<string, never>;
			"/api/subjects": Record<string, never>;
			"/api/users": Record<string, never>;
			"/(auth)/login": Record<string, never>;
			"/(parent)/parent": Record<string, never>;
			"/(parent)/parent/attendance": Record<string, never>;
			"/(parent)/parent/children": Record<string, never>;
			"/(parent)/parent/invoices": Record<string, never>;
			"/(parent)/parent/profile": Record<string, never>;
			"/(parent)/parent/reports": Record<string, never>;
			"/(auth)/register-tutor": Record<string, never>;
			"/(auth)/register": Record<string, never>;
			"/(student)/student": Record<string, never>;
			"/(student)/student/attendance": Record<string, never>;
			"/(student)/student/profile": Record<string, never>;
			"/(student)/student/program": Record<string, never>;
			"/(student)/student/reports": Record<string, never>;
			"/(tutor)/tutor": Record<string, never>;
			"/(tutor)/tutor/attendance": Record<string, never>;
			"/(tutor)/tutor/jobboard": Record<string, never>;
			"/(tutor)/tutor/payroll": Record<string, never>;
			"/(tutor)/tutor/profile": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/analytics" | "/admin/attendance" | "/admin/candidates" | "/admin/classes" | "/admin/invoices" | "/admin/jobs" | "/admin/levels" | "/admin/magic-links" | "/admin/packages" | "/admin/payroll" | "/admin/profile" | "/admin/reports-admin" | "/admin/students" | "/admin/students/parent" | "/admin/subjects" | "/admin/tutors" | "/admin/tutors/magic-links" | "/admin/users" | "/api/attendances" | "/api/auth/login" | "/api/auth/logout" | "/api/auth/session" | "/api/candidates" | "/api/classes" | "/api/db" | "/api/education-levels" | "/api/enrollments" | "/api/geocode" | "/api/invoices" | "/api/jobs" | "/api/magic-links" | "/api/packages" | "/api/payroll" | "/api/subjects" | "/api/users" | "/login" | "/parent" | "/parent/attendance" | "/parent/children" | "/parent/invoices" | "/parent/profile" | "/parent/reports" | "/register-tutor" | "/register" | "/student" | "/student/attendance" | "/student/profile" | "/student/program" | "/student/reports" | "/tutor" | "/tutor/attendance" | "/tutor/jobboard" | "/tutor/payroll" | "/tutor/profile";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/logo-sentraedu.jpg" | string & {};
	}
}