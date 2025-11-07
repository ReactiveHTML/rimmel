import { addListener } from "../lib/addListener";
import type { RMLEventListener, HTMLEventName } from "../types/dom";
import type { Sink } from "../types/sink";

export const EventHandlerSink: Sink<HTMLElement> = (node: HTMLElement, e: HTMLEventName) =>
    (handler: RMLEventListener, options?: AddEventListenerOptions) =>
        addListener(node, e, handler, options);
