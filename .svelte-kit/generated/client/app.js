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
	() => import('./nodes/44')
];

export const server_loads = [];

export const dictionary = {
		"/": [6],
		"/(admin)/admin": [7,[2]],
		"/(admin)/admin/analytics": [8,[2]],
		"/(admin)/admin/attendance": [9,[2]],
		"/(admin)/admin/candidates": [10,[2]],
		"/(admin)/admin/classes": [11,[2]],
		"/(admin)/admin/invoices": [12,[2]],
		"/(admin)/admin/jobs": [13,[2]],
		"/(admin)/admin/levels": [14,[2]],
		"/(admin)/admin/magic-links": [15,[2]],
		"/(admin)/admin/packages": [16,[2]],
		"/(admin)/admin/payroll": [17,[2]],
		"/(admin)/admin/profile": [18,[2]],
		"/(admin)/admin/reports-admin": [19,[2]],
		"/(admin)/admin/students": [20,[2]],
		"/(admin)/admin/students/parent": [21,[2]],
		"/(admin)/admin/subjects": [22,[2]],
		"/(admin)/admin/tutors": [23,[2]],
		"/(admin)/admin/tutors/magic-links": [24,[2]],
		"/(admin)/admin/users": [25,[2]],
		"/(auth)/login": [26],
		"/(parent)/parent": [29,[3]],
		"/(parent)/parent/attendance": [30,[3]],
		"/(parent)/parent/children": [31,[3]],
		"/(parent)/parent/invoices": [32,[3]],
		"/(parent)/parent/profile": [33,[3]],
		"/(parent)/parent/reports": [34,[3]],
		"/(auth)/register-tutor": [28],
		"/(auth)/register": [27],
		"/(student)/student": [35,[4]],
		"/(student)/student/attendance": [36,[4]],
		"/(student)/student/profile": [37,[4]],
		"/(student)/student/program": [38,[4]],
		"/(student)/student/reports": [39,[4]],
		"/(tutor)/tutor": [40,[5]],
		"/(tutor)/tutor/attendance": [41,[5]],
		"/(tutor)/tutor/jobboard": [42,[5]],
		"/(tutor)/tutor/payroll": [43,[5]],
		"/(tutor)/tutor/profile": [44,[5]]
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