import type * as Kit from '@sveltejs/kit';

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;
type RouteParams = {  };
type RouteId = '/';
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureDefined<T> = T extends null | undefined ? {} : T;
type OptionalUnion<U extends Record<string, any>, A extends keyof U = U extends U ? keyof U : never> = U extends unknown ? { [P in Exclude<A, keyof U>]?: never } & U : never;
export type Snapshot<T = any> = Kit.Snapshot<T>;
type PageParentData = EnsureDefined<LayoutData>;
type LayoutRouteId = RouteId | "/" | "/(auth)/login" | "/(auth)/register" | "/(auth)/register-tutor" | "/(dashboard)/admin" | "/(dashboard)/admin/analytics" | "/(dashboard)/admin/attendance" | "/(dashboard)/admin/candidates" | "/(dashboard)/admin/classes" | "/(dashboard)/admin/invoices" | "/(dashboard)/admin/jobs" | "/(dashboard)/admin/levels" | "/(dashboard)/admin/magic-links" | "/(dashboard)/admin/packages" | "/(dashboard)/admin/payroll" | "/(dashboard)/admin/profile" | "/(dashboard)/admin/reports-admin" | "/(dashboard)/admin/students" | "/(dashboard)/admin/students/parent" | "/(dashboard)/admin/subjects" | "/(dashboard)/admin/tutors" | "/(dashboard)/admin/tutors/magic-links" | "/(dashboard)/admin/users" | "/(dashboard)/analytics" | "/(dashboard)/attendance" | "/(dashboard)/candidates" | "/(dashboard)/children" | "/(dashboard)/classes" | "/(dashboard)/dashboard" | "/(dashboard)/invoices" | "/(dashboard)/job-board" | "/(dashboard)/jobs" | "/(dashboard)/levels" | "/(dashboard)/magic-links" | "/(dashboard)/packages" | "/(dashboard)/parent" | "/(dashboard)/parent/attendance" | "/(dashboard)/parent/children" | "/(dashboard)/parent/invoices" | "/(dashboard)/parent/profile" | "/(dashboard)/parent/reports" | "/(dashboard)/payroll" | "/(dashboard)/profile" | "/(dashboard)/program" | "/(dashboard)/reports" | "/(dashboard)/reports-admin" | "/(dashboard)/student" | "/(dashboard)/student/attendance" | "/(dashboard)/student/profile" | "/(dashboard)/student/program" | "/(dashboard)/student/reports" | "/(dashboard)/students" | "/(dashboard)/students/parent" | "/(dashboard)/subjects" | "/(dashboard)/tutor" | "/(dashboard)/tutor/attendance" | "/(dashboard)/tutor/jobboard" | "/(dashboard)/tutor/payroll" | "/(dashboard)/tutor/profile" | "/(dashboard)/tutors" | "/(dashboard)/tutors/magic-links" | "/(dashboard)/users" | null
type LayoutParams = RouteParams & {  }
type LayoutParentData = EnsureDefined<{}>;

export type PageServerData = null;
export type PageData = Expand<PageParentData>;
export type PageProps = { params: RouteParams; data: PageData }
export type LayoutServerData = null;
export type LayoutLoad<OutputData extends OutputDataShape<LayoutParentData> = OutputDataShape<LayoutParentData>> = Kit.Load<LayoutParams, LayoutServerData, LayoutParentData, OutputData, LayoutRouteId>;
export type LayoutLoadEvent = Parameters<LayoutLoad>[0];
export type LayoutData = Expand<Omit<LayoutParentData, keyof LayoutParentData & EnsureDefined<LayoutServerData>> & OptionalUnion<EnsureDefined<LayoutParentData & EnsureDefined<LayoutServerData>>>>;
export type LayoutProps = { params: LayoutParams; data: LayoutData; children: import("svelte").Snippet }