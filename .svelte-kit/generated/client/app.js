// in dev, this makes Vite inject its client as this module's first dependency,
// so that global constant replacements are installed before any other module
// (including user hooks) evaluates. In build it's inert.
import.meta.hot;




export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33'),
	() => import('./nodes/34'),
	() => import('./nodes/35'),
	() => import('./nodes/36'),
	() => import('./nodes/37'),
	() => import('./nodes/38'),
	() => import('./nodes/39'),
	() => import('./nodes/40'),
	() => import('./nodes/41'),
	() => import('./nodes/42'),
	() => import('./nodes/43'),
	() => import('./nodes/44'),
	() => import('./nodes/45'),
	() => import('./nodes/46'),
	() => import('./nodes/47'),
	() => import('./nodes/48'),
	() => import('./nodes/49'),
	() => import('./nodes/50'),
	() => import('./nodes/51'),
	() => import('./nodes/52'),
	() => import('./nodes/53'),
	() => import('./nodes/54'),
	() => import('./nodes/55'),
	() => import('./nodes/56'),
	() => import('./nodes/57'),
	() => import('./nodes/58'),
	() => import('./nodes/59'),
	() => import('./nodes/60'),
	() => import('./nodes/61'),
	() => import('./nodes/62')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/(dashboard)/admin": [7,[2]],
		"/(dashboard)/admin/analitik": [8,[2]],
		"/(dashboard)/admin/attendance": [9,[2]],
		"/(dashboard)/admin/candidates": [10,[2]],
		"/(dashboard)/admin/invoices": [11,[2]],
		"/(dashboard)/admin/jobs": [12,[2]],
		"/(dashboard)/admin/laporan": [13,[2]],
		"/(dashboard)/admin/levels": [14,[2]],
		"/(dashboard)/admin/magic-links": [15,[2]],
		"/(dashboard)/admin/packages": [16,[2]],
		"/(dashboard)/admin/payroll": [17,[2]],
		"/(dashboard)/admin/profile": [18,[2]],
		"/(dashboard)/admin/students": [19,[2]],
		"/(dashboard)/admin/students/wali": [20,[2]],
		"/(dashboard)/admin/subjects": [21,[2]],
		"/(dashboard)/admin/tentors": [22,[2]],
		"/(dashboard)/admin/tentors/magic-links": [23,[2]],
		"/(dashboard)/admin/users": [24,[2]],
		"/(dashboard)/analitik": [25,[2]],
		"/(dashboard)/attendance": [26,[2]],
		"/(dashboard)/candidates": [27,[2]],
		"/(dashboard)/children": [28,[2]],
		"/(dashboard)/dashboard": [29,[2]],
		"/(dashboard)/invoices": [30,[2]],
		"/(dashboard)/jobboard": [31,[2]],
		"/(dashboard)/jobs": [32,[2]],
		"/(dashboard)/laporan": [33,[2]],
		"/(dashboard)/levels": [34,[2]],
		"/(auth)/login": [4],
		"/(dashboard)/magic-links": [35,[2]],
		"/(dashboard)/packages": [36,[2]],
		"/(dashboard)/payroll": [37,[2]],
		"/(dashboard)/profile": [38,[2]],
		"/(dashboard)/program": [39,[2]],
		"/(auth)/register-tentor": [6],
		"/(auth)/register": [5],
		"/(dashboard)/reports": [40,[2]],
		"/(dashboard)/students": [46,[2]],
		"/(dashboard)/students/wali": [47,[2]],
		"/(dashboard)/student": [41,[2]],
		"/(dashboard)/student/attendance": [42,[2]],
		"/(dashboard)/student/profile": [43,[2]],
		"/(dashboard)/student/program": [44,[2]],
		"/(dashboard)/student/reports": [45,[2]],
		"/(dashboard)/subjects": [48,[2]],
		"/(dashboard)/tentors": [54,[2]],
		"/(dashboard)/tentors/magic-links": [55,[2]],
		"/(dashboard)/tentor": [49,[2]],
		"/(dashboard)/tentor/attendance": [50,[2]],
		"/(dashboard)/tentor/jobboard": [51,[2]],
		"/(dashboard)/tentor/payroll": [52,[2]],
		"/(dashboard)/tentor/profile": [53,[2]],
		"/(dashboard)/users": [56,[2]],
		"/(dashboard)/wali": [57,[2]],
		"/(dashboard)/wali/attendance": [58,[2]],
		"/(dashboard)/wali/children": [59,[2]],
		"/(dashboard)/wali/invoices": [60,[2]],
		"/(dashboard)/wali/profile": [61,[2]],
		"/(dashboard)/wali/reports": [62,[2]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';

export const get_error_template = () => import('../shared/error-template.js').then(m => m.default);