import { HTMLEventName } from "../types/dom"

export const eventListnerSource = (node: HTMLElement, eventName: HTMLEventName, handler: EventListenerOrEventListenerObject) =>
    node.addEventListener(eventName, handler, {capture: true});
