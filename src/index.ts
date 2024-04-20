import { mount } from './lifecycle/lifecycle-handler';
import rml from './parser/parser';

const init = (root = document.documentElement) => {
	const mo = new MutationObserver(mount);
	mo.observe(root, { attributes: false, childList: true, subtree: true });
};

/*
export const setRoot = (e: HTMLElement): RML => {
	const root = e;
	init(root);
	return rml;
}
*/

init();

// TODO: remove
export { DOMSinks } from './sinks';

// Sink Factories
export { Signal } from './sinks/signal-sink';

// Utilities
export type { Component, Mixin } from './types/constructs';

// Types
export type { Sink, SinkFunction } from './types/sink';
export type { DOMObject, HTMLContainerElement, HTMLString } from './types/dom';

// Main entries
export const render = rml;  // Deprecated, always use rml instead. Compat only. Will be removed shortly.
export const html = rml;    // Shall we?
export { default as rml } from './parser/parser';
