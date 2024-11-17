import type { RMLEventName } from "../types/dom";
import type { SourceBindingConfiguration } from "../types/internal";

import { NON_BUBBLING_DOM_EVENTS } from "../definitions/non-bubbling-events";
import { DELEGATE_EVENTS, INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, REF_TAG, RESOLVE_ATTRIBUTE, RESOLVE_SELECTOR, RML_DEBUG, USE_DOM_OBSERVABLES } from "../constants";

import { delegatedEventHandlers, subscriptions, waitingElementHanlders } from "../internal-state";
import { delegateEvent } from "../lifecycle/event-delegation";
import { isSinkBindingConfiguration } from "../types/internal";
import { subscribe } from "../lib/drain";
import { terminationHandler } from "../sinks/termination-sink";
import { tracing } from "../debug";

const AUTOREMOVE_LISTENERS_DELAY = 100; // Cleanup event listeners after this much time
const elementNodes = (n: Node): n is Element => n.nodeType == 1;

// class LifecycleEvent extends CustomEvent{};

const errorHandler = console.error;

export const Rimmel_Bind_Subtree = (node: Element): void => {
	// Data-to-be-bound text nodes in an element (<div>${thing1} ${thing2}</div>);
	const intermediateInteractiveNodes: Node[] = [];

	const hasInteractiveTextNodes = [...node.childNodes].some(n => {
		return n.nodeType == 3 && n.nodeValue?.includes(INTERACTIVE_NODE_START);
	});

	// Interactive text nodes
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
			} else {
				nodes.push(n);
			}
		}
		node.innerHTML = '';
		node.append(...nodes);
	}

	const bindingRef = <string>node.getAttribute(RESOLVE_ATTRIBUTE);
	(waitingElementHanlders.get(bindingRef) ?? []).forEach(function Rimmel_Bind_Element(bindingConfiguration) {
		const debugThisNode = node.hasAttribute(RML_DEBUG);
		if(tracing && debugThisNode) {
			/* Stopped at data binding */
			debugger;
		}

		if (isSinkBindingConfiguration(bindingConfiguration)) {
			// DATA SINKS

			// TODO: bindingConfiguration.sinkParams may itself be a promise or an observable, so need to subscribe to it
			const targetNode = intermediateInteractiveNodes.shift() ?? node;
			const { sink, t } = bindingConfiguration;
			const sinkFn = sink(targetNode, bindingConfiguration.params);

			// A pre-sink step that can show the above sinkFn in a stack trace for debugging
			const loggingSinkFn = (...data: any) => {
				console.groupCollapsed('RML: Sinking', t, data);
				console.log(bindingConfiguration);
				console.trace('Stack Trace (from Source to Sink), data=', data);
				sinkFn(...data)
				console.groupEnd();
			};

			// This is the actual sink that will be bound to a source
			const sinkFn2 = tracing && debugThisNode ? loggingSinkFn : sinkFn;

			// #IFDEF DEBUG
			if(tracing && debugThisNode) {
				console.groupCollapsed('RML: Binding', t, targetNode);
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
		} else {
			// EVENT SOURCES

			const sourceBindingConfiguration = <SourceBindingConfiguration<RMLEventName>>bindingConfiguration;
			const { eventName } = sourceBindingConfiguration;

			// We only use event delegation for bubbling events. Non-bubbling events will have their own listener attached directly.
			// TODO: shall we support direct, non-delegated event handling, as well (for a little extra performance boost, what else?)
			if (!DELEGATE_EVENTS || NON_BUBBLING_DOM_EVENTS.has(eventName) || node.getRootNode() instanceof ShadowRoot) {
				// We add an event listener for all those events who don't bubble by default (as we're delegating them to the top)
				// We also force-add an event listener if we're inside a ShadowRoot (do we really need to?), as events inside web components don't seem to fire otherwise
				if(USE_DOM_OBSERVABLES && node.when) {
					const l = sourceBindingConfiguration.listener;
					const source = node.when(eventName)
					source.subscribe(l.native ? l(source) : l);
				} else {
					 node.addEventListener(eventName, sourceBindingConfiguration.listener);
				}
			} else {
				const isNonBubblingEvent = NON_BUBBLING_DOM_EVENTS.has(eventName);
				if(!isNonBubblingEvent && DELEGATE_EVENTS) {
					delegateEvent(eventName);
				}
				delegatedEventHandlers.get(node)?.push(sourceBindingConfiguration) ?? delegatedEventHandlers.set(node, [sourceBindingConfiguration])
			}

			if (eventName == 'rml:mount') {
				// Will need to bubble so that it can be captured by the delegated event handler
				setTimeout(() => node.dispatchEvent(new CustomEvent('rml:mount', { bubbles: true, detail: {} })), 0);
				//node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}}))
			}
		}

	});

	node.removeAttribute(RESOLVE_ATTRIBUTE);
	waitingElementHanlders.delete(bindingRef);
};

export const removeListeners = (node: Element) => {
	if(document.contains(node)) {
		// Don't remove listeners if the node has just been moved across (so it's back in the DOM)
		return
	}

	[...node.children as unknown as Element[]]
		//.filter(n => document.contains(n))
		.forEach(node => removeListeners(node))
	;

	// TODO: add AbortController support for cancelable promises?
	subscriptions.get(node)?.forEach(l => {
		// HACK: — destination is not a supported API for Subscription...
		// l?.destination?.complete(); // do we need this, BTW?

		// console.debug('Rimmel: Unsubscribing', node, l);
		l.unsubscribe?.()
	});
	subscriptions.delete(node);
};

/**
 * Main callback triggered when an element is added to the DOM
 * Here is where we start the data binding process
 */
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

	setTimeout(() => removedNodes.forEach(removeListeners), AUTOREMOVE_LISTENERS_DELAY)
	;
};
