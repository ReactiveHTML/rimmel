import { HTMLEventName } from "../types/dom"

const options = { }; // TODO: define better
export const eventListnerSource =
	(node: HTMLElement, eventName: HTMLEventName, handler: EventListenerOrEventListenerObject) =>
		node.addEventListener(eventName, handler, options)
;
