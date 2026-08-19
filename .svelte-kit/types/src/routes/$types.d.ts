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
type LayoutRouteId = RouteId | "/" | "/(auth)/login" | "/(auth)/register" | "/(auth)/register-tentor" | "/(dashboard)/admin" | "/(dashboard)/admin/analitik" | "/(dashboard)/admin/attendance" | "/(dashboard)/admin/candidates" | "/(dashboard)/admin/invoices" | "/(dashboard)/admin/jobs" | "/(dashboard)/admin/laporan" | "/(dashboard)/admin/levels" | "/(dashboard)/admin/magic-links" | "/(dashboard)/admin/packages" | "/(dashboard)/admin/payroll" | "/(dashboard)/admin/profile" | "/(dashboard)/admin/students" | "/(dashboard)/admin/students/wali" | "/(dashboard)/admin/subjects" | "/(dashboard)/admin/tentors" | "/(dashboard)/admin/tentors/magic-links" | "/(dashboard)/admin/users" | "/(dashboard)/analitik" | "/(dashboard)/attendance" | "/(dashboard)/candidates" | "/(dashboard)/children" | "/(dashboard)/dashboard" | "/(dashboard)/invoices" | "/(dashboard)/jobboard" | "/(dashboard)/jobs" | "/(dashboard)/laporan" | "/(dashboard)/levels" | "/(dashboard)/magic-links" | "/(dashboard)/packages" | "/(dashboard)/payroll" | "/(dashboard)/profile" | "/(dashboard)/program" | "/(dashboard)/reports" | "/(dashboard)/student" | "/(dashboard)/student/attendance" | "/(dashboard)/student/profile" | "/(dashboard)/student/program" | "/(dashboard)/student/reports" | "/(dashboard)/students" | "/(dashboard)/students/wali" | "/(dashboard)/subjects" | "/(dashboard)/tentor" | "/(dashboard)/tentor/attendance" | "/(dashboard)/tentor/jobboard" | "/(dashboard)/tentor/payroll" | "/(dashboard)/tentor/profile" | "/(dashboard)/tentors" | "/(dashboard)/tentors/magic-links" | "/(dashboard)/users" | "/(dashboard)/wali" | "/(dashboard)/wali/attendance" | "/(dashboard)/wali/children" | "/(dashboard)/wali/invoices" | "/(dashboard)/wali/profile" | "/(dashboard)/wali/reports" | null
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