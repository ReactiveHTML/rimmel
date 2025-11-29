import { addListener } from "../lib/addListener";
import type { EventListener, HTMLEventName } from "../types/dom";

export const eventListnerSource = (node: HTMLElement, eventName: HTMLEventName, handler: EventListener<Event>, options?: AddEventListenerOptions) =>
	addListener(node, eventName, handler, options)
;

