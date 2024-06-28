import {tap} from 'rxjs';

import { tracing } from "../debug";
import { subscribe } from "../lib/drain";
import { errorHandler } from "../sinks/error-sink";
import { EventListenerFunction, RMLEventName } from "../types/dom";
import { delegatedEventHandlers, subscriptions, waitingElementHanlders } from "../internal-state";
import { HTMLEventName } from "../types/dom";
import { isFunction } from "../utils/is-function";
import { NON_BUBBLING_DOM_EVENTS } from "../definitions/non-bubbling-events";
import { INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, REF_TAG, RESOLVE_SELECTOR, RML_DEBUG } from "../constants";
import { Observer } from "../types/futures";
import { RMLTemplateExpression, BindingConfiguration, isSinkBindingConfiguration, SourceBindingConfiguration } from "../types/internal";
import { Source } from "../types/source";
import { terminationHandler } from "../sinks/termination-sink";

const elementNodes = (n: Node): n is Element => n.nodeType == 1;

// class LifecycleEvent extends CustomEvent{};

export const Rimmel_Bind_Subtree = (node: Element): void => {
	const intermediateInteractiveNodes: Node[] = []; // Text nodes in a tag;
	([...node.attributes] || [])
		.forEach(attr => {
			const key = attr.nodeName;
			const value = attr.nodeValue;
			if(value == null) {
				// FIXME: is this ever actually going to be null???
				return;
			}
			const eventName = <RMLEventName>key.replace(/^(rml:)?on/, '$1'); // TODO: based on the convention onsomething = on::something. Is this 100% ok?
			const isOnMount = /^(?:rml:)?onmount$/.test(key);
			const isEventSource = eventName !== key;
			const isRef = value.includes(REF_TAG);
			const hasInteractiveTextNodes = node.innerHTML.includes(INTERACTIVE_NODE_START);
			// Interactive text nodes
			//const splat = isRef && node.innerHTML.split(value as string) || []; // FIXME: it's unsafe to split by #REFn, as the same text may legitimately be in the page. Use some invisible unprintable codes
			if(hasInteractiveTextNodes) {
				const splat = node.innerHTML.split(INTERACTIVE_NODE_START) || []; // FIXME: it's unsafe to split by #REFn, as the same text may legitimately be in the page. Use some invisible unprintable codes
				const nodes = <string[]>[splat.shift()];
				for (const sx of splat) {
					const [interactiveNode, txt] = sx.split(INTERACTIVE_NODE_END);
					const tn = document.createTextNode(interactiveNode ?? ''); // or "value"?
					intermediateInteractiveNodes.push(tn); // do we have an initial value we can add straight away?
					nodes.push(tn, txt);
					//node.insertAdjacentHTML('beforeend', splat[1]);
				}
				node.innerHTML = '';
				node.append(...nodes);
			}

			// if (isRef || isOnMount || isEventSource) {
			if (isRef) {
				node.removeAttribute(key);
				(waitingElementHanlders.get(value) ?? [])
					.forEach(function Rimmel_Bind_Element(bindingConfiguration) {

						const debugThisNode = node.hasAttribute(RML_DEBUG);
						if(tracing && debugThisNode) {
							// Mounted, binding data
							debugger;
						}

						if (isSinkBindingConfiguration(bindingConfiguration)) {
							// DATA SINKS

							// TODO: bindingConfiguration.sinkParams may itself be a promise or an observable, so need to subscribe to it
							const targetNode = intermediateInteractiveNodes.shift() ?? node;
							const sink = bindingConfiguration.sink;
							const sinkFn = sink(targetNode, bindingConfiguration.params);

							// A pre-sink step that can show the above sinkFn in a stack trace for debugging
							const loggingSinkFn = (...data: any) => {
								console.groupCollapsed('RML: Sinking', value, data);
								console.log(bindingConfiguration);
								console.trace('Stack Trace (from Source to Sink), data=', data);
								sinkFn(...data)
								console.groupEnd();
							};

							// This is the actual sink that will be bound to a source
							const sinkFn2 = tracing && debugThisNode ? loggingSinkFn : sinkFn;

							// #IFDEF DEBUG
							if(tracing && debugThisNode) {
								console.groupCollapsed('RML: Binding', value, targetNode);
								console.dir(targetNode);
								// console.trace('Rimmel_Bind_Element')
								console.debug('Node: %o', targetNode);
								console.debug('Conf: %o', bindingConfiguration);
								console.debug('Sink: %o', sinkFn2);
								console.groupEnd();
							}
							// #ENDIF

							// The source that's going to feed the current sink
							// const sourceStream =
							// 	isSource
							// 	?? ((bindingConfiguration.attribute?.then ?? bindingConfiguration.attribute?.subscribe) && bindingConfiguration.attribute)
							// 	?? bindingConfiguration.handler
							// ;

							const sourceStream = bindingConfiguration.source;

							subscribe(targetNode, sourceStream, sinkFn2, bindingConfiguration.error ?? errorHandler, bindingConfiguration.termination ?? terminationHandler);
						} else /* if (isSource(bindingConfiguration)) { // || isOnMount) { */ {
							// EVENT SOURCES

							const sourcceBindingConfiguration = <SourceBindingConfiguration<typeof eventName>>bindingConfiguration;

							const listener = sourcceBindingConfiguration.listener;
							// listener was bound in the parser...
							// const boundListener =
							// 	isFunction(listener) ? (<EventListenerFunction>listener).bind(node) :
							// 	isFunction((<Observer<unknown>>listener).next) ? (<Observer<unknown>>listener).next.bind(listener) :
							// 	null
							// ;

							if (NON_BUBBLING_DOM_EVENTS.has(eventName)) {
								node.addEventListener(eventName, listener, { capture: true });
							}
							// if it's an event source (like onclick, etc)
							// Object.keys(conf).length && handlers.set(node, ([] as RMLTemplateExpression<typeof node>[]).concat(handlers.get(node) || [], <RMLTemplateExpression<typeof node>>{ ...(conf as BindingConfiguration<typeof node>), handler: boundHandler }));

							// if (Object.keys(conf).length) {
							// if (!Object.keys(conf).length) {
							// 	console.warn('EMPTY CONF', node, conf)
							// }
							delegatedEventHandlers.get(node)?.push(sourcceBindingConfiguration) ?? delegatedEventHandlers.set(node, [sourcceBindingConfiguration])
						}

				});

				waitingElementHanlders.delete(value);

				if (isOnMount) {
					// Will need to bubble so that it can be captured by the delegated event handler
					setTimeout(() => node.dispatchEvent(new CustomEvent('rml:mount', { bubbles: true, detail: {} })), 0);
					//node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}}))
				}
			}
		});
};

export const removeListeners = (node: Element) => {
	// FIXME: what if someone (e.g.: JQuery's .css()) was just moving the element across the DOM?
	// We lose the subscriptions/data binding...
	[...node.children]
		.forEach(node => removeListeners(node))
	;

	// TODO: add AbortController support for cancelable promises?
	subscriptions.get(node)?.forEach(l => {
		l?.destination?.complete(); // do we need this?
		l.unsubscribe?.()
	});
	subscriptions.delete(node);
};

export const Rimmel_Mount: MutationCallback = (mutationsList, observer) => {
	const childList = mutationsList
		.filter(m => m.type === 'childList')
	;

	// TODO: performance - use document.createTreeWalker
	const addedNodes = childList
		.flatMap(m => ([...m.addedNodes])) // .values() for an iterator, according to TS
		.filter(elementNodes)
	;

	addedNodes
		.flatMap(node => [node].concat(...(node.querySelectorAll(RESOLVE_SELECTOR))))
		.forEach(Rimmel_Bind_Subtree)
	;

	// TODO: performance - use document.createTreeWalker
	const removedNodes = childList
		.flatMap(m => ([...m.removedNodes])) // .values() for an iterator, according to TS
		.filter(elementNodes)
	;

	removedNodes
		.forEach(removeListeners)
	;
};
