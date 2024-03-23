import { isFunction } from "../utils/is-function";
import { handlers, subscriptions, waitingElementHanlders } from "../internal-state";
import { errorHandler } from "../sinks/error-sink";
import { DOMSinks } from "../sinks/index";
import { terminationHandler } from "../sinks/termination-sink";
import { Observer } from "../types/futures";
import { Handler } from "../types/internal";
import { HandlerFunction } from "../types/dom";
import { HTMLEventName } from "../types/dom";
import { Sink } from "../types/sink";

const debug = {
	leave_refs: false,
};

export const nonBubblingAttributes = new Set(['ended', 'play', 'pause', 'volumechange']); // TODO: add more?
const elementNodes = (n: Node) => n.nodeType == 1;

export const transferAttributes = (node: HTMLElement): void => {
	// ([].concat(...node.attributes) || []))
	(Array.from(node.attributes) || [])
		.forEach(attr => {
			const key = attr.nodeName;
			const value = attr.nodeValue;
			const eventName = <HTMLEventName>key.replace(/^on/, '');
			const isEventSource = eventName !== key;
			const splat = /^#REF\d+$/.test(value as string) && node.innerHTML.split(value as string) || [];
			let intermediateInteractiveNode: Node; // Text;
			if (splat.length == 2) {
				intermediateInteractiveNode = document.createTextNode(''); // +initial value?

				node.innerHTML = splat[0];
				node.append(intermediateInteractiveNode);
				node.insertAdjacentHTML('beforeend', splat[1]);
			}

			if (/^#REF/.test(value as string) || key == 'onmount' || isEventSource) {
				debug.leave_refs || node.removeAttribute(key);

				(waitingElementHanlders.get(value as string) || []).forEach(conf => {
					const hand = conf.handler;
					const boundHandler =
						isFunction(hand) ? (<HandlerFunction>hand).bind(node) :
							isFunction((<Observer<unknown>>hand).next) ? (<Observer<unknown>>hand).next.bind(hand) :
								null
						;

					if (boundHandler && nonBubblingAttributes.has(eventName)) {
						node.addEventListener(eventName, boundHandler, { capture: true });
					} else if (conf.type == 'event' || conf.type == 'source' || key == 'onmount') {
						// if it's an event source (like onclick, etc)
						Object.keys(conf).length && handlers.set(node, ([] as Handler[]).concat(handlers.get(node) || [], <Handler>{ ...conf, handler: boundHandler }));
						//} else if(key != 'onmount' && (key != 'resolve' || ['innerHTML', 'innerText', 'attribute', 'attributeset', 'class', 'classset', 'dataset'].includes(conf.type))) {
						//} else if(conf.type == 'attributeset') {
						//	attributesSink(node)(hand) // merge attributes in // some could have gone in earlier, e.g.: class, or other attributes, but will after mount. Is that ok?
					} else {
						if (DOMSinks.has(conf.type)) { // if it's a sink (innerHTML, etc)
							// TODO: conf.attribute may itself be a promise or an observable, so need to subscribe to it
							const sink = DOMSinks.get(conf.type) as Sink;
							const sinkFn = sink(<HTMLElement>intermediateInteractiveNode || node, conf.attribute);
							const sourceStream = conf.attribute?.then || conf.attribute?.subscribe ? conf.attribute : conf.handler;
							// console.log('sourceStream TYPE', typeof sourceStream, sourceStream);
							const subscription =
								sourceStream.then ? sourceStream.then(sinkFn, conf.error || errorHandler)
								: sourceStream.subscribe ? sourceStream.subscribe(sinkFn, conf.error || errorHandler, conf.termination || terminationHandler)
								: typeof sourceStream == 'function' ? sourceStream(node)
								: typeof sourceStream == 'object' ? sink(node)(sourceStream)
								: () => { } // Maybe lose this?
							;

							if (sourceStream.subscribe) {
								const subscriptionList = subscriptions.get(node) || [];
								subscriptionList.push(subscription);
								subscriptions.set(node, subscriptionList);
							}
						}
					}
				});
				waitingElementHanlders.delete(value as string);

				if (key == 'onmount') {
					// TODO: namespace and rename event to rml:onmount?
					setTimeout(() => node.dispatchEvent(new CustomEvent('mount', { bubbles: true, detail: {} })), 0);
					//node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}}))
				}
			}
		});
};

export const removeListeners = (node: Element) => {
	[...node.children]
		.forEach(node => removeListeners(node as HTMLElement));
	subscriptions.get(node)?.forEach(l => l.unsubscribe?.());
	subscriptions.delete(node);
};

export const mount: MutationCallback = (mutationsList, observer) => {
	const childList = mutationsList
		.filter(m => m.type === 'childList')
	;

	// TODO: performance - use document.createTreeWalker
	const addedNodes = childList
		.flatMap(m => ([...m.addedNodes])) // .values() for an iterator, according to TS
		.filter(elementNodes) as HTMLElement[]
	;

	addedNodes
		.flatMap(node => ([node] as HTMLElement[]).concat(...(node.querySelectorAll('[RESOLVE]') as unknown as HTMLElement[])))
		.forEach(transferAttributes)
	;

	// TODO: performance - use document.createTreeWalker
	const removedNodes = childList
		.flatMap(m => ([...m.removedNodes])) // .values() for an iterator, according to TS
		.filter(elementNodes) as HTMLElement[]
	;

	removedNodes
		.forEach(removeListeners as (node: Node) => void)
	;
};
