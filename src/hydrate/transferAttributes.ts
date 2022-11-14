import { isFunction } from '../util';
import { nonBubblingAttributes } from '../constants';
import {
	handlers,
	waitingElementHanlders,
} from '../cache';
import { attributesSink, DOMSinks } from '../sinks';
import { ElementBindingConfig } from '../types';

export function transferAttributes(node: Element): void {
	([...node.attributes])
		.forEach(attr => {
			const key = attr.nodeName;
			const value = attr.nodeValue;
			const eventName = key.replace(/^on/, '');
			const isEventSource = eventName !== key;

			if(/^#REF/.test(value as string) || key == 'onmount' || isEventSource) {
				node.removeAttribute(key);

				(waitingElementHanlders.get(value) || []).forEach((conf: ElementBindingConfig) => {
					const hand = conf.handler
					const boundHandler = isFunction(hand) ? hand.bind(node) : isFunction(hand.next) ? hand.next.bind(hand) : null

					if(nonBubblingAttributes.has(eventName)) {
						node.addEventListener(eventName, boundHandler)
					} else if(conf.type == 'event' || conf.type == 'source' || key == 'onmount') {
						// if it's an event source (like onclick, etc)
						Object.keys(conf).length && handlers.set(node, [].concat(handlers.get(node) || [], {...conf, handler: boundHandler}))
					//} else if(key != 'onmount' && (key != 'resolve' || ['innerHTML', 'innerText', 'attribute', 'attributeset', 'class', 'classset', 'dataset'].includes(conf.type))) {
					} else if(conf.type == 'attributeset') {
						attributesSink(node as HTMLElement)(hand) // merge attributes in // some could have gone in earlier, e.g.: class, or other attributes, but will after mount. Is that ok?
					} else {
						if(DOMSinks.has(conf.type)) { // if it's a sink (innerHTML, etc)
							const subscriptionCallback = DOMSinks.get(conf.type)(node, conf.attribute)
							const subscription =
								conf.handler.then ? conf.handler.then(subscriptionCallback).catch(conf.error || undefined) :
								conf.handler.subscribe ? conf.handler.subscribe(subscriptionCallback, conf.termination || undefined, conf.error || undefined) :
								() => {}
							subscriptions.add(subscription)
						}
					}
				})
				waitingElementHanlders.delete(value)

				if(key == 'onmount') {
					setTimeout(()=>node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}})), 0)
					//node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}}))
				}
			}
		})
}