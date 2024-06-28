import { RMLEventName } from "./dom";
import { EventListenerOrEventListenerAdapter } from "./event-listener";
import type { Observer, Subject } from "./futures";
import { BindingConfiguration } from "./internal";

/**
 * A module responsible to get data events (e.g.: DOM events, network calls, etc)
 */
export interface SourceDescriptor<E extends Event, R> {
    bubbles?: boolean;
    defaultPrevented?: boolean;
    source?: EventListenerOrEventListenerAdapter<E, R>;
    handler: Observer<R> | ((data: R) => boolean);
}

/**
 * An event "preprocessor" responsible to get raw events
 * (e.g.: DOM events, network calls, etc) and transform them into
 * something suitable for a UI-agnostic stream (typically a view-model)
 * @param target The Observer to send events to
 * @returns A Subject that will receive the actual DOM events
 * @example SourceStream(target)
 */
export type Source<E extends Event, T=E> = (target: Observer<T>) => Subject<E>;

export const isSource = (x: BindingConfiguration) => x.type == 'source'
