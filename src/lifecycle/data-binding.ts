import type { EventListenerFunction } from "../types/dom";
import type { MonkeyPatchedObservable }	from '../types/monkey-patched-observable';
import type { RMLEventName } from "../types/dom";
import type { SourceBindingConfiguration } from "../types/internal";

import { INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, RESOLVE_ATTRIBUTE, RESOLVE_SELECTOR, RML_DEBUG, USE_DOM_OBSERVABLES } from "../constants";

import { subscriptions, waitingElementHanlders } from "../internal-state";
import { isSinkBindingConfiguration } from "../types/internal";
import { subscribe } from "../lib/drain";
import { terminationHandler } from "../sinks/termination-sink";
import { tracing } from "../debug";
import { IObservature, isObservature } from "../lib/observature";
import { SinkFunction } from "../types";

const AUTOREMOVE_LISTENERS_DELAY = 100; // Cleanup event listeners after this much time
const elementNodes = (n: Node): n is Element => n.nodeType == 1;

// class LifecycleEvent extends CustomEvent{};

const errorHandler = console.error;

const isEventListenerObject = (l: any): l is EventListenerObject =>
	typeof l == 'object' && 'handleEvent' in l
;

export const Rimmel_Bind_Subtree = (node: Element): void => {
	// Data-to-be-bound text nodes in an element (<div>${thing1} ${thing2}</div>);
	const intermediateInteractiveNodes: Node[] = [];

	const hasInteractiveTextNodes = [...node.childNodes].some(n => {
		return n.nodeType == 3 && n.nodeValue?.includes(INTERACTIVE_NODE_START);
	});

	if(hasInteractiveTextNodes) {
		// Bind interactive "text nodes"
		// TODO: shall we use some ad-hoc container elements, instead? <text-wrapper>
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

		// #IFDEF ENABLE_RML_DEBUGGER
		if(tracing && debugThisNode) {
			/* Stopped at data binding */
			debugger;
		}
		// #ENDIF ENABLE_RML_DEBUGGER

		if (isSinkBindingConfiguration(bindingConfiguration)) {
			// DATA SINKS

			// TODO: bindingConfiguration.sinkParams may itself be a promise or an observable, so need to subscribe to it
			const targetNode = intermediateInteractiveNodes.shift() ?? node;
			const { sink, t } = bindingConfiguration;
			const sinkFn = sink(targetNode, bindingConfiguration.params);

			// A pre-sink step that can show the above sinkFn in a stack trace for debugging
			const loggingSinkFn: SinkFunction = (...data: any) => {
				console.groupCollapsed('RML: Sinking', t, data);
				console.log(bindingConfiguration);
				console.trace('Stack Trace (from Source to Sink), data=', data);
				sinkFn(...data)
				console.groupEnd();
			};

			// #IFDEF ENABLE_RML_DEBUGGER
			// This is the actual sink that will be bound to a source
			const sinkFn2 = tracing && debugThisNode ? loggingSinkFn : sinkFn;

			if(tracing && debugThisNode) {
				console.groupCollapsed('RML: Binding', t, targetNode);
				console.dir(targetNode);
				console.debug('Node: %o', targetNode);
				console.debug('Conf: %o', bindingConfiguration);
				console.debug('Sink: %o', sinkFn2);
				console.groupEnd();
			}
			// #ELSE
			// const sinkFn2 = sinkFn;
			// #ENDIF ENABLE_RML_DEBUGGER

			const sourceStream = bindingConfiguration.source;

			subscribe(targetNode, sourceStream, sinkFn2, bindingConfiguration.error ?? errorHandler, bindingConfiguration.termination ?? terminationHandler);
		} else {
			// EVENT SOURCES

			const sourceBindingConfiguration = <SourceBindingConfiguration<RMLEventName>>bindingConfiguration;
			const { eventName } = sourceBindingConfiguration;

			// We add an event listener for all those events who don't bubble by default (as we're delegating them to the top)
			// We also force-add an event listener if we're inside a ShadowRoot (do we really need to?), as events inside web components don't seem to fire otherwise
			if(USE_DOM_OBSERVABLES && node.when) {
				const l = <EventListenerFunction | IObservature<Event>>sourceBindingConfiguration.listener;
				if(!isEventListenerObject(l)) {
					const source = node.when(eventName, <ObservableEventListenerOptions | undefined>sourceBindingConfiguration.options);
					if(isObservature(l)) {
						(<IObservature<Event>>l).addSource(source as MonkeyPatchedObservable<Event>);
					} else {
						// TODO: Add AbortController
						source.subscribe(l);
					}
				}
			} else {
				node.addEventListener(eventName, sourceBindingConfiguration.listener, sourceBindingConfiguration.options);
				// #REF49993849837451
				// const listenerRef = [eventName, sourceBindingConfiguration.listener, sourceBindingConfiguration.options];
				// node.addEventListener(...listenerRef);
				// listeners.get(node)?.push?.(listenerRef) ?? listeners.set(node, [listenerRef]);
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
		// FIXME: DOM Observables don't have unsubscribe => Use AbortControllers
		l?.unsubscribe?.()
	});
	subscriptions.delete(node);

	// #REF49993849837451 Just leaving this around, but there's no need to manually
	// remove listeners. DevTools might suggest otherwise, but HE is holding on to
	// EventListeners in memory, not Rimmel.
	// listeners.get(node)?.forEach(ref => node.removeEventListener(...ref));
	// listeners.delete(node);
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

	// TODO: switch when ready
	// requestIdleCallback(() => removedNodes.forEach(removeListeners));
	setTimeout(() => removedNodes.forEach(removeListeners), AUTOREMOVE_LISTENERS_DELAY)
};
