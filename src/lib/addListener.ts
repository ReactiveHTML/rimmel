import { RMLEventName } from "../types";
import { IObservature, isObservature } from "./observature";
import { USE_DOM_OBSERVABLES } from "../constants";
import { MonkeyPatchedObservable } from "../types/monkey-patched-observable";
import { RMLEventListener } from "../types/event-listener";
import { toListener } from "../utils/to-listener";


const isEventListenerObject = (l: any): l is EventListenerObject =>
	typeof l == 'object' && 'handleEvent' in l
;

export const addListener = (node: EventTarget, eventName: RMLEventName, listener: RMLEventListener, options?: AddEventListenerOptions | boolean) => {
    // We also force-add an event listener if we're inside a ShadowRoot (do we really need to?), as events inside web components don't seem to fire otherwise
    if (USE_DOM_OBSERVABLES && node.when) {
        if (!isEventListenerObject(listener)) {
            const source = node.when(eventName, <ObservableEventListenerOptions | undefined>options);
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

    if (eventName == 'rml:mount') {
        // class LifecycleEvent extends CustomEvent{};
        // Will this need to bubble up? (probably no)
        setTimeout(() => node.dispatchEvent(new CustomEvent('rml:mount', { detail: {} })), 0);
        //node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}}))
    }
};