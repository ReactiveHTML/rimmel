import { EventHandler, HTMLEventName } from "../types/dom"

export const eventListnerSource = (node: HTMLElement, eventName: HTMLEventName, handler: EventHandler) =>
    node.addEventListener(eventName, handler, {capture: true});
