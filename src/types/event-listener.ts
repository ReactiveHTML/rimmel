import type { BehaviorSubject, Subject } from 'rxjs';
import type { EventListenerOrEventListenerObject, RMLEventMap } from './dom';

/**
 * A map of all HTML events
 */
export type HTMLEventMap = HTMLElementEventMap & {
    'onmount': Event; // deprecated, don't use
    'onunmount': Event; // deprecated, don't use
};

/**
 * An event source mapper that transforms a DOM event into a convenience type
 */
export type EventListenerOrEventListenerAdapter<E extends Event, T> = (e: E) => T;
export type EventSubject<T> = Subject<T> | BehaviorSubject<T>;

/**
 * A record of event listener attributes and their corresponding typed event handlers
 * @example onmousemove: <Handler<MouseEvent>>
 */
export type EventObject = {
    [K in keyof HTMLEventMap as `on${string & K}`]?: EventListenerOrEventListenerObject<HTMLEventMap[K]> | EventSubject<HTMLEventMap[K]>;
} & {
    [K in keyof RMLEventMap]?: EventListenerOrEventListenerObject<RMLEventMap[K]> | EventSubject<RMLEventMap[K]>;
};
