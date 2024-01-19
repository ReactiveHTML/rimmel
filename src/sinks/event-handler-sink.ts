import { EventName, EventHandler } from "../types/dom"
import { Sink } from "../types/sink"

export const eventHandlerSink: Sink = (node: HTMLElement) =>
    (e: EventName, h: EventHandler) => node.addEventListener(e, h);
