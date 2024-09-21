import type { RMLEventName } from "../types/dom";

import { NON_BUBBLING_DOM_EVENTS } from "../definitions/non-bubbling-events";
import { INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, REF_TAG, RESOLVE_SELECTOR, RML_DEBUG } from "../constants";

import { delegatedEventHandlers, subscriptions, waitingElementHanlders } from "../internal-state";
import { errorHandler } from "../sinks/error-sink";
import { isSinkBindingConfiguration, SourceBindingConfiguration } from "../types/internal";
import { subscribe } from "../lib/drain";
import { terminationHandler } from "../sinks/termination-sink";
import { tracing } from "../debug";
import { of } from "rxjs";

const elementNodes = (n: Node): n is Element => n.nodeType == 1;

// class LifecycleEvent extends CustomEvent{};

export const Rimmel_Bind_Subtree = (node: Element): void => {
	const intermediateInteractiveNodes: Node[] = []; // Text nodes in a tag;

	// const hasInteractiveTextNodes = node.innerHTML.includes(INTERACTIVE_NODE_START);
	const hasInteractiveTextNodes = [...node.childNodes].some(n => {
		return n.nodeType == 3 && n.nodeValue?.includes(INTERACTIVE_NODE_START);
	});

	// Interactive text nodes
	//const splat = hasRef && node.innerHTML.split(value as string) || []; // FIXME: it's unsafe to split by #REFn, as the same text may legitimately be in the page. Use some invisible unprintable codes
	if(hasInteractiveTextNodes) {
		const nodes = <(Node | string)[]>[];
		for (const n of node.childNodes) {
			if(n.nodeType == 3) {
				const nodeValue: string = n.nodeValue!;
				const interactiveRE = new RegExp(`[${INTERACTIVE_NODE_START}${INTERACTIVE_NODE_END}]`);
				const interleaved = nodeValue.split(interactiveRE);
				const il = interleaved.length;
				for(var i=0; i<il; i+=2) {
					const txt = interleaved[i];
					nodes.push(txt);

					const value = interleaved[i +1];
					if(value != undefined) {
						const tn = document.createTextNode(value); // or "value"?
						intermediateInteractiveNodes.push(tn); // do we have an initial value we can add straight away?
						nodes.push(tn);
					}
				}

				// const [txt, interactiveNode] = nodeValue.split(INTERACTIVE_NODE_START);
				// nodes.push(txt);
				// if(interactiveNode) {
				// 	const tn = document.createTextNode(interactiveNode ?? ''); // or "value"?
				// 	intermediateInteractiveNodes.push(tn); // do we have an initial value we can add straight away?
				// 	nodes.push(tn);
				// }
			} else {
				nodes.push(n);
			}
		}
		node.innerHTML = '';
		node.append(...nodes);
	}


	([...node.attributes as unknown as Attr[]] || [])
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
			const hasRef = value.includes(REF_TAG);

			// if (hasRef || isOnMount || isEventSource) {
			if (hasRef) {
				node.removeAttribute(key);
				(waitingElementHanlders.get(value) ?? [])
					.forEach(function Rimmel_Bind_Element(bindingConfiguration) {

						const debugThisNode = node.hasAttribute(RML_DEBUG);
						if(tracing && debugThisNode) {
							debugger; /* Stopped binding data */
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

							if (NON_BUBBLING_DOM_EVENTS.has(eventName) || node.getRootNode() instanceof ShadowRoot) {
								// We add an event listener for all those events who don't bubble by default (as we're delegating them to the top)
								// We also force-add an event listener if we're inside a ShadowRoot (do we really need to?), as events inside web components don't seem to fire otherwise
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
	[...node.children as unknown as Element[]]
		.forEach(node => removeListeners(node))
	;

	// TODO: add AbortController support for cancelable promises?
	subscriptions.get(node)?.forEach(l => {
		// FIXME: HACK — destination is not a supported API for Subscription...
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
