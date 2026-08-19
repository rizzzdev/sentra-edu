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
	() => import('./nodes/62'),
	() => import('./nodes/63'),
	() => import('./nodes/64')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/(dashboard)/admin": [7,[2]],
		"/(dashboard)/admin/analytics": [8,[2]],
		"/(dashboard)/admin/attendance": [9,[2]],
		"/(dashboard)/admin/candidates": [10,[2]],
		"/(dashboard)/admin/classes": [11,[2]],
		"/(dashboard)/admin/invoices": [12,[2]],
		"/(dashboard)/admin/jobs": [13,[2]],
		"/(dashboard)/admin/levels": [14,[2]],
		"/(dashboard)/admin/magic-links": [15,[2]],
		"/(dashboard)/admin/packages": [16,[2]],
		"/(dashboard)/admin/payroll": [17,[2]],
		"/(dashboard)/admin/profile": [18,[2]],
		"/(dashboard)/admin/reports-admin": [19,[2]],
		"/(dashboard)/admin/students": [20,[2]],
		"/(dashboard)/admin/students/parent": [21,[2]],
		"/(dashboard)/admin/subjects": [22,[2]],
		"/(dashboard)/admin/tutors": [23,[2]],
		"/(dashboard)/admin/tutors/magic-links": [24,[2]],
		"/(dashboard)/admin/users": [25,[2]],
		"/(dashboard)/analytics": [26,[2]],
		"/(dashboard)/attendance": [27,[2]],
		"/(dashboard)/candidates": [28,[2]],
		"/(dashboard)/children": [29,[2]],
		"/(dashboard)/classes": [30,[2]],
		"/(dashboard)/dashboard": [31,[2]],
		"/(dashboard)/invoices": [32,[2]],
		"/(dashboard)/job-board": [33,[2]],
		"/(dashboard)/jobs": [34,[2]],
		"/(dashboard)/levels": [35,[2]],
		"/(auth)/login": [4],
		"/(dashboard)/magic-links": [36,[2]],
		"/(dashboard)/packages": [37,[2]],
		"/(dashboard)/parent": [38,[2]],
		"/(dashboard)/parent/attendance": [39,[2]],
		"/(dashboard)/parent/children": [40,[2]],
		"/(dashboard)/parent/invoices": [41,[2]],
		"/(dashboard)/parent/profile": [42,[2]],
		"/(dashboard)/parent/reports": [43,[2]],
		"/(dashboard)/payroll": [44,[2]],
		"/(dashboard)/profile": [45,[2]],
		"/(dashboard)/program": [46,[2]],
		"/(auth)/register-tutor": [6],
		"/(auth)/register": [5],
		"/(dashboard)/reports-admin": [48,[2]],
		"/(dashboard)/reports": [47,[2]],
		"/(dashboard)/students": [54,[2]],
		"/(dashboard)/students/parent": [55,[2]],
		"/(dashboard)/student": [49,[2]],
		"/(dashboard)/student/attendance": [50,[2]],
		"/(dashboard)/student/profile": [51,[2]],
		"/(dashboard)/student/program": [52,[2]],
		"/(dashboard)/student/reports": [53,[2]],
		"/(dashboard)/subjects": [56,[2]],
		"/(dashboard)/tutors": [62,[2]],
		"/(dashboard)/tutors/magic-links": [63,[2]],
		"/(dashboard)/tutor": [57,[2]],
		"/(dashboard)/tutor/attendance": [58,[2]],
		"/(dashboard)/tutor/jobboard": [59,[2]],
		"/(dashboard)/tutor/payroll": [60,[2]],
		"/(dashboard)/tutor/profile": [61,[2]],
		"/(dashboard)/users": [64,[2]]
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