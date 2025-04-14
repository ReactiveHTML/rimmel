import type { HTMLEventName } from "../types/dom";
import type { Sink } from "../types/sink";

export const EventHandlerSink: Sink<HTMLElement> = (node: HTMLElement, e: HTMLEventName) =>
	// FIXME: wrap h and options in an object, as nothing will emit both values!
	// TODO: use addListener() instead of this
	(h: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
		node.addEventListener(e, h, options);
		// ? node.removeEventListener(e, h) // FIXME: to be able to remove an event listener, will need to store a reference to it first!
		// : node.addEventListener(e, h)
	};
