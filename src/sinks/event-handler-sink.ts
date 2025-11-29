import { addListener } from "../lib/addListener";
import type { EventListener, HTMLEventName } from "../types/dom";
import type { Sink } from "../types/sink";

// FIXME: wrap handler and options in an object, x streams can't emit both values!
// Alternatively, set it in the constructor
export const EventHandlerSink: Sink<HTMLElement> = (node: HTMLElement, e: HTMLEventName) =>
	(handler: EventListener<Event>, options?: AddEventListenerOptions) =>
		// FIXME: to be able to remove an event listener, will need to store a reference to it first!
		addListener(node, e, handler, options)
;

