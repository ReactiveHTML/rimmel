import { Rimmel_Mount } from './lifecycle/data-binding';
import rml from './parser/parser';

export const init = (root = document.documentElement) => {
	const mo = new MutationObserver(Rimmel_Mount);
	mo.observe(root, { attributes: false, childList: true, subtree: true });
};

// import { Rimmel_Bind_Subtree } from './lifecycle/data-binding';
// export const activate = Rimmel_Bind_Subtree;

/*
export const setRoot = (e: Element): RML => {
	const root = e;
	init(root);
	return rml;
}
*/

init();

// Types
export type { Sink, SinkFunction } from './types/sink';
export type { SinkBindingConfiguration } from './types/internal';
export type { Stream } from './types/futures';
export type { DocumentObject, HTMLContainerElement, HTMLString } from './types/dom';

export { inputPipe, pipeIn } from './utils/input-pipe';

// Event Sources
export * from './sources/index';

// Data Sinks
export * from './sinks/index';

// Experimental Web Component support
export { RegisterElement } from './custom-element';

// Utilities (Will take them out to the framework)
export type { Component, Mixin } from './types/constructs';
export type { RMLTemplateExpressions } from './types/internal';

// Main entries
export const html = rml;    // Shall we?
export { default as rml } from './parser/parser';

// Experimental stuff
// export { rml } from 'rml/scandal';

