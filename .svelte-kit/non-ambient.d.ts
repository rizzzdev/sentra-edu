
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
		RouteId(): "/(dashboard)" | "/(auth)" | "/" | "/(dashboard)/admin" | "/(dashboard)/admin/analytics" | "/(dashboard)/admin/attendance" | "/(dashboard)/admin/candidates" | "/(dashboard)/admin/classes" | "/(dashboard)/admin/invoices" | "/(dashboard)/admin/jobs" | "/(dashboard)/admin/levels" | "/(dashboard)/admin/magic-links" | "/(dashboard)/admin/packages" | "/(dashboard)/admin/payroll" | "/(dashboard)/admin/profile" | "/(dashboard)/admin/reports-admin" | "/(dashboard)/admin/students" | "/(dashboard)/admin/students/parent" | "/(dashboard)/admin/subjects" | "/(dashboard)/admin/tutors" | "/(dashboard)/admin/tutors/magic-links" | "/(dashboard)/admin/users" | "/(dashboard)/analytics" | "/api" | "/api/attendances" | "/api/auth" | "/api/auth/login" | "/api/auth/logout" | "/api/auth/session" | "/api/candidates" | "/api/classes" | "/api/db" | "/api/education-levels" | "/api/enrollments" | "/api/invoices" | "/api/jobs" | "/api/magic-links" | "/api/packages" | "/api/payroll" | "/api/subjects" | "/api/users" | "/(dashboard)/attendance" | "/(dashboard)/candidates" | "/(dashboard)/children" | "/(dashboard)/classes" | "/(dashboard)/dashboard" | "/(dashboard)/invoices" | "/(dashboard)/job-board" | "/(dashboard)/jobs" | "/(dashboard)/levels" | "/(auth)/login" | "/(dashboard)/magic-links" | "/(dashboard)/packages" | "/(dashboard)/parent" | "/(dashboard)/parent/attendance" | "/(dashboard)/parent/children" | "/(dashboard)/parent/invoices" | "/(dashboard)/parent/profile" | "/(dashboard)/parent/reports" | "/(dashboard)/payroll" | "/(dashboard)/profile" | "/(dashboard)/program" | "/(auth)/register-tutor" | "/(auth)/register" | "/(dashboard)/reports-admin" | "/(dashboard)/reports" | "/(dashboard)/students" | "/(dashboard)/students/parent" | "/(dashboard)/student" | "/(dashboard)/student/attendance" | "/(dashboard)/student/profile" | "/(dashboard)/student/program" | "/(dashboard)/student/reports" | "/(dashboard)/subjects" | "/(dashboard)/tutors" | "/(dashboard)/tutors/magic-links" | "/(dashboard)/tutor" | "/(dashboard)/tutor/attendance" | "/(dashboard)/tutor/jobboard" | "/(dashboard)/tutor/payroll" | "/(dashboard)/tutor/profile" | "/(dashboard)/users";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/(dashboard)": Record<string, never>;
			"/(auth)": Record<string, never>;
			"/": Record<string, never>;
			"/(dashboard)/admin": Record<string, never>;
			"/(dashboard)/admin/analytics": Record<string, never>;
			"/(dashboard)/admin/attendance": Record<string, never>;
			"/(dashboard)/admin/candidates": Record<string, never>;
			"/(dashboard)/admin/classes": Record<string, never>;
			"/(dashboard)/admin/invoices": Record<string, never>;
			"/(dashboard)/admin/jobs": Record<string, never>;
			"/(dashboard)/admin/levels": Record<string, never>;
			"/(dashboard)/admin/magic-links": Record<string, never>;
			"/(dashboard)/admin/packages": Record<string, never>;
			"/(dashboard)/admin/payroll": Record<string, never>;
			"/(dashboard)/admin/profile": Record<string, never>;
			"/(dashboard)/admin/reports-admin": Record<string, never>;
			"/(dashboard)/admin/students": Record<string, never>;
			"/(dashboard)/admin/students/parent": Record<string, never>;
			"/(dashboard)/admin/subjects": Record<string, never>;
			"/(dashboard)/admin/tutors": Record<string, never>;
			"/(dashboard)/admin/tutors/magic-links": Record<string, never>;
			"/(dashboard)/admin/users": Record<string, never>;
			"/(dashboard)/analytics": Record<string, never>;
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
			"/api/invoices": Record<string, never>;
			"/api/jobs": Record<string, never>;
			"/api/magic-links": Record<string, never>;
			"/api/packages": Record<string, never>;
			"/api/payroll": Record<string, never>;
			"/api/subjects": Record<string, never>;
			"/api/users": Record<string, never>;
			"/(dashboard)/attendance": Record<string, never>;
			"/(dashboard)/candidates": Record<string, never>;
			"/(dashboard)/children": Record<string, never>;
			"/(dashboard)/classes": Record<string, never>;
			"/(dashboard)/dashboard": Record<string, never>;
			"/(dashboard)/invoices": Record<string, never>;
			"/(dashboard)/job-board": Record<string, never>;
			"/(dashboard)/jobs": Record<string, never>;
			"/(dashboard)/levels": Record<string, never>;
			"/(auth)/login": Record<string, never>;
			"/(dashboard)/magic-links": Record<string, never>;
			"/(dashboard)/packages": Record<string, never>;
			"/(dashboard)/parent": Record<string, never>;
			"/(dashboard)/parent/attendance": Record<string, never>;
			"/(dashboard)/parent/children": Record<string, never>;
			"/(dashboard)/parent/invoices": Record<string, never>;
			"/(dashboard)/parent/profile": Record<string, never>;
			"/(dashboard)/parent/reports": Record<string, never>;
			"/(dashboard)/payroll": Record<string, never>;
			"/(dashboard)/profile": Record<string, never>;
			"/(dashboard)/program": Record<string, never>;
			"/(auth)/register-tutor": Record<string, never>;
			"/(auth)/register": Record<string, never>;
			"/(dashboard)/reports-admin": Record<string, never>;
			"/(dashboard)/reports": Record<string, never>;
			"/(dashboard)/students": Record<string, never>;
			"/(dashboard)/students/parent": Record<string, never>;
			"/(dashboard)/student": Record<string, never>;
			"/(dashboard)/student/attendance": Record<string, never>;
			"/(dashboard)/student/profile": Record<string, never>;
			"/(dashboard)/student/program": Record<string, never>;
			"/(dashboard)/student/reports": Record<string, never>;
			"/(dashboard)/subjects": Record<string, never>;
			"/(dashboard)/tutors": Record<string, never>;
			"/(dashboard)/tutors/magic-links": Record<string, never>;
			"/(dashboard)/tutor": Record<string, never>;
			"/(dashboard)/tutor/attendance": Record<string, never>;
			"/(dashboard)/tutor/jobboard": Record<string, never>;
			"/(dashboard)/tutor/payroll": Record<string, never>;
			"/(dashboard)/tutor/profile": Record<string, never>;
			"/(dashboard)/users": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/analytics" | "/admin/attendance" | "/admin/candidates" | "/admin/classes" | "/admin/invoices" | "/admin/jobs" | "/admin/levels" | "/admin/magic-links" | "/admin/packages" | "/admin/payroll" | "/admin/profile" | "/admin/reports-admin" | "/admin/students" | "/admin/students/parent" | "/admin/subjects" | "/admin/tutors" | "/admin/tutors/magic-links" | "/admin/users" | "/analytics" | "/api/attendances" | "/api/auth/login" | "/api/auth/logout" | "/api/auth/session" | "/api/candidates" | "/api/classes" | "/api/db" | "/api/education-levels" | "/api/enrollments" | "/api/invoices" | "/api/jobs" | "/api/magic-links" | "/api/packages" | "/api/payroll" | "/api/subjects" | "/api/users" | "/attendance" | "/candidates" | "/children" | "/classes" | "/dashboard" | "/invoices" | "/job-board" | "/jobs" | "/levels" | "/login" | "/magic-links" | "/packages" | "/parent" | "/parent/attendance" | "/parent/children" | "/parent/invoices" | "/parent/profile" | "/parent/reports" | "/payroll" | "/profile" | "/program" | "/register-tutor" | "/register" | "/reports-admin" | "/reports" | "/students" | "/students/parent" | "/student" | "/student/attendance" | "/student/profile" | "/student/program" | "/student/reports" | "/subjects" | "/tutors" | "/tutors/magic-links" | "/tutor" | "/tutor/attendance" | "/tutor/jobboard" | "/tutor/payroll" | "/tutor/profile" | "/users";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/logo-sentraedu.jpg" | string & {};
	}
}