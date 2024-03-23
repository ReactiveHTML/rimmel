import { mount } from './lifecycle/lifecycle-handler';
import rml from './parser/parser';

const init = (root = document.documentElement) => {
	const mo = new MutationObserver(mount);
	mo.observe(root, { attributes: false, childList: true, subtree: true });
}

/*
const setRoot = (e: HTMLElement): RML => {
	const root = e;
	init(root);
	return rml;
}
*/

init();

export { default as rml } from './parser/parser';
export const render = rml;  // Deprecated, always use rml instead. Compat only,
export { SinkSpecifier as Sink } from './sinks';
export { DOMSinks } from './sinks';

