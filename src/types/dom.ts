import { ClassAttribute } from "./class";
import { DatasetObject } from "./dataset";
import { EventObject } from "./event-listener";
import { GenericAttribute } from "./attribute";
import { StyleObject } from "./style";
import { ValueAttribute } from "./value";
import { ContentAttribute } from "./content";
import { MaybeFuture } from "./futures";

type RemovePrefix<TPrefix extends string, TString extends string> = TString extends `${TPrefix}${infer T}` ? T : never;

/**
 * An HTML event name prefixed by 'on'
 */
export type HTMLEventAttributeName = keyof HTMLElement & `on${string}`;

/**
 * An HTML event name without the 'on' prefix
 */
export type HTMLEventName = RemovePrefix<'on', HTMLEventAttributeName>;

/**
 * A RML event name prefixed by 'on', which includes all HTML events and RML events (currently only 'onmount').
 */
export type RMLEventAttributeName = HTMLEventAttributeName | 'onmount';

/**
 * A RML event name without the 'on' prefix, which includes all HTML events and RML events.
 */
export type RMLEventName = RemovePrefix<'on', RMLEventAttributeName>;

/**
 * A string representing HTML code
 */
export type HTMLString = string & { _HTMLStringBrand: never };
// export interface JSONArray extends Array<JSON> {};


// TODO use EventListenerOrEventListenerObject

export type HandlerFunction = (event: Event, handledTarget?: EventTarget | null) => Boolean;

interface EventListenerFunction {
    (e: Event): void;
}

/**
 * Any HTMLElement that can have child elements
 */
export type HTMLContainerElement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap];

interface EventListenerObject {
    handleEvent(e: Event): void;
}

export type EventListener = EventListenerFunction | EventListenerObject | undefined;

// export type DOMObject<E extends HTMLElement> = EventObject & ClassAttribute & DatasetObject & StyleObject & ValueAttribute<E> & ContentAttribute & GenericAttribute;

export interface DOMObject extends EventObject, GenericAttribute {
    style?: StyleObject;
    dataset?: DatasetObject;
    class?: ClassAttribute;

    innerHTML?: MaybeFuture<HTMLString>;
    innerText?: MaybeFuture<HTMLString>;
    textContent?: MaybeFuture<HTMLString>;

    value?: string | MaybeFuture<string>;
};
