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
	() => import('./nodes/22')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/(dashboard)/analitik": [5,[2]],
		"/(dashboard)/attendance": [6,[2]],
		"/(dashboard)/candidates": [7,[2]],
		"/(dashboard)/children": [8,[2]],
		"/(dashboard)/dashboard": [9,[2]],
		"/(dashboard)/invoices": [10,[2]],
		"/(dashboard)/jobboard": [11,[2]],
		"/(dashboard)/jobs": [12,[2]],
		"/(dashboard)/laporan": [13,[2]],
		"/(dashboard)/levels": [14,[2]],
		"/(auth)/login": [4],
		"/(dashboard)/packages": [15,[2]],
		"/(dashboard)/payroll": [16,[2]],
		"/(dashboard)/profile": [17,[2]],
		"/(dashboard)/program": [18,[2]],
		"/(dashboard)/reports": [19,[2]],
		"/(dashboard)/students": [20,[2]],
		"/(dashboard)/subjects": [21,[2]],
		"/(dashboard)/users": [22,[2]]
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