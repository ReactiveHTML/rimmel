import type { BehaviorSubject, Subject } from "rxjs";

interface LifecycleEvent extends CustomEvent {};

/**
 * A map of all HTML events
 */
export type HTMLEventMap = HTMLElementEventMap & {
    'onmount': Event; // deprecated, don't use
    'onunmount': Event; // deprecated, don't use
};

/**
 * A map of all RML custom events that extend standard HTML
 * These include basic lifecycle events
 */
export type RMLEventMap = {
    'rml:onmount': LifecycleEvent;
    'rml:onunmount': LifecycleEvent;
};

/**
 * A generic equivalent of the DOM's EventListenerOrEventListenerObject
 */
export type EventListenerOrEventListenerObject<T = Event> = ((evt: T) => void) | { handleEvent: (evt: T) => void };

/**
 * An event source mapper that transforms a DOM event into a convenience type
 */
export type EventListenerOrEventListenerAdapter<E extends Event, T> = (e: E) => T;
type EventSubject<T> = Subject<T> | BehaviorSubject<T>;

/**
 * A record of event listener attributes and their corresponding typed event handlers
 * @example onmousemove: <Handler<MouseEvent>>
 */
export type EventObject = {
    [K in keyof HTMLEventMap as `on${string & K}`]?: EventListenerOrEventListenerObject<HTMLEventMap[K]> | EventSubject<HTMLEventMap[K]>;
} & {
    [K in keyof RMLEventMap]?: EventListenerOrEventListenerObject<RMLEventMap[K]> | EventSubject<RMLEventMap[K]>;
};
