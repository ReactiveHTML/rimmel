import type { RMLEventName, EventListener } from "../types/dom";
import type { Sink } from "../types/sink";

export const EventHandlerSink: Sink = (node: HTMLElement, e: RMLEventName) =>
	// FIXME: wrap h and options in an object, as nothing will emit both values!
	(h: EventListener, options?: boolean | AddEventListenerOptions) => {
		h === undefined
		? node.removeEventListener(e, h) // FIXME: to be able to remove an event listener, will need to store a reference to it first!
		: node.addEventListener(e, h)
		;
	};
