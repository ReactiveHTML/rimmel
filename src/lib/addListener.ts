import { RMLEventName } from "../types";
import { IObservature, isObservature } from "./observature";
import { USE_DOM_OBSERVABLES } from "../constants";
import { MonkeyPatchedObservable } from "../types/monkey-patched-observable";
import { RMLEventListener } from "../types/event-listener";
import { toListener } from "../utils/to-listener";

const isEventListenerObject = (l: any): l is EventListenerObject => !!l?.handleEvent;

export const addListener = (node: EventTarget, eventName: RMLEventName, listener: RMLEventListener, options?: AddEventListenerOptions | boolean) => {
	// We also force-add an event listener if we're inside a ShadowRoot (do we really need to?), as events inside web components don't seem to fire otherwise
	if (USE_DOM_OBSERVABLES && (node as any).when) {
		// Explicitly excluding the isEventListenerObject as Domenic doesn't want .when() to support it
		if (!isEventListenerObject(listener)) {
			const source = (node as any).when(eventName, <ObservableEventListenerOptions | undefined>options);
			if (isObservature(listener)) {
				(<IObservature<Event>>listener).addSource(source as MonkeyPatchedObservable<Event>);
			} else {
				// TODO: Add AbortController
				source.subscribe(listener);
			}
		}
	} else {
		node.addEventListener(eventName, toListener(listener), <EventListenerOptions | undefined>options);
		// #REF49993849837451
		// const listenerRef = [eventName, sourceBindingConfiguration.listener, sourceBindingConfiguration.options];
		// node.addEventListener(...listenerRef);
		// listeners.get(node)?.push?.(listenerRef) ?? listeners.set(node, [listenerRef]);
	}

	if (/^(?:rml:)?mount/.test(eventName)) {
		// Will this need to bubble up? (probably no)
		setTimeout(() => node.dispatchEvent(new Event(eventName)));
	}
};
