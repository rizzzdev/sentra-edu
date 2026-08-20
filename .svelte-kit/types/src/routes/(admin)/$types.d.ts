import type * as Kit from '@sveltejs/kit';

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;
type RouteParams = {  };
type RouteId = '/(admin)';
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureDefined<T> = T extends null | undefined ? {} : T;
type OptionalUnion<U extends Record<string, any>, A extends keyof U = U extends U ? keyof U : never> = U extends unknown ? { [P in Exclude<A, keyof U>]?: never } & U : never;
export type Snapshot<T = any> = Kit.Snapshot<T>;
type LayoutRouteId = RouteId | "/(admin)/admin" | "/(admin)/admin/analytics" | "/(admin)/admin/attendance" | "/(admin)/admin/candidates" | "/(admin)/admin/classes" | "/(admin)/admin/invoices" | "/(admin)/admin/jobs" | "/(admin)/admin/levels" | "/(admin)/admin/magic-links" | "/(admin)/admin/packages" | "/(admin)/admin/payroll" | "/(admin)/admin/profile" | "/(admin)/admin/reports-admin" | "/(admin)/admin/students" | "/(admin)/admin/students/parent" | "/(admin)/admin/subjects" | "/(admin)/admin/tutors" | "/(admin)/admin/tutors/magic-links" | "/(admin)/admin/users"
type LayoutParams = RouteParams & {  }
type LayoutParentData = EnsureDefined<import('../$types.js').LayoutData>;

export type LayoutServerData = null;
export type LayoutData = Expand<LayoutParentData>;
export type LayoutProps = { params: LayoutParams; data: LayoutData; children: import("svelte").Snippet }