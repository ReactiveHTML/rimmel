import { ClassAttribute } from "./class";
import { DatasetObject } from "./dataset";
import { EventObject } from "./event-listener";
import { GenericAttribute } from "./attribute";
import { StyleObject } from "./style";
import { ValueAttribute } from "./value";
import { ContentAttribute } from "./content";
import { MaybeFuture } from "./futures";
import { RMLTemplateExpressions } from "./internal";
import { BOOLEAN_ATTRIBUTES, BooleanAttribute } from "../definitions/boolean-attributes";

export type RemovePrefix<TPrefix extends string, TString extends string> = TString extends `${TPrefix}${infer T}` ? T : TString extends `rml:${TPrefix}${infer T}` ? `rml:${T}` : never;


/**
 * A CSS selector string
 */
export type CSSSelector = string;

/**
 * An HTML event name prefixed by 'on'
 */
export type HTMLEventAttributeName = keyof HTMLElement & `on${string}`;

/**
 * An HTML event name without the 'on' prefix
 */
export type HTMLEventName = RemovePrefix<'on', HTMLEventAttributeName>;

/**
 * The Name of an HTML element
 */
export type HTMLElementName = string;

/**
 * A RML event name prefixed by 'on', which includes all HTML events and RML events (currently only 'onmount').
 */
export type RMLEventAttributeName =
  | HTMLEventAttributeName
  | "rml:onmount"
;

/**
 * A RML event name without the 'on' prefix, which includes all HTML events and RML events.
 */
export type RMLEventName = RemovePrefix<'on', RMLEventAttributeName>;

/**
 * An element lifecycle event, such as mount, onmount, etc
 */
export interface LifecycleEvent extends CustomEvent {
};

/**
 * Any RML event, which includes all HTML Events and RML events.
 */
export type RMLEventMap = HTMLElementEventMap & {
    mount: LifecycleEvent; // Assuming 'mount' events use the base Event class
    unmount: LifecycleEvent; // Assuming 'mount' events use the base Event class
    'rml:mount': LifecycleEvent; // Assuming 'mount' events use the base Event class
    'rml:unmount': LifecycleEvent; // Assuming 'mount' events use the base Event class
};

/**
 * Utility function that returns the type of Event that a corresponding listener will receive
 */
export type EventType<N extends string> = N extends keyof RMLEventMap ? RMLEventMap[N] : never;

/**
 * A string representing HTML code
 * @example const str = '<div>Hello</div>' as HTMLString;
 */
export type HTMLString = string & { _HTMLStringBrand: never };
// export interface JSONArray extends Array<JSON> {};

/**
 * A string representing CSS "key: value;" code
 */
export type CSSString = string & { _CSSStringBrand: never };

/**
 * Any HTML Element that can have child elements
 */
export type HTMLContainerElement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap];

/**
 * Any HTML Element that has a "value" attribute
 */
export type HTMLFieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Any HTML Element meant to handle numbers, even if the DOM exposes them as strings
 */
export type HTMLNumericFieldElement = HTMLInputElement & { type: 'number' | 'range' };

export const isNumericFieldElement = (e: Element): e is HTMLNumericFieldElement => e instanceof HTMLInputElement && (e.type === 'number' || e.type === 'range');

// TODO use EventListenerOrEventListenerObject (or not, because it's not a generic in the DOM, but we want it to be?)
export type EventListenerFunction<E extends Event = Event> = (event: E, handledTarget?: EventTarget | null) => void;
export interface EventListenerObject<E extends Event | any> {
    handleEvent(e: E): void;
};

export type EventListener<E extends Event> = EventListenerFunction<E> | EventListenerObject<E>;
export type EventListenerOrEventListenerObject<E extends Event> = EventListener<E>;

// /**
//  * A generic equivalent of the DOM's EventListenerOrEventListenerObject
//  */
// export type EventListenerOrEventListenerObject<T = Event> = ((evt: T) => void) | { handleEvent: (evt: T) => void };

export type BooleanAttributeValue<T extends BooleanAttribute> = MaybeFuture<boolean | T | 'true'>;

type DisabledType = 'disabled';


// export type DocumentObject<E extends HTMLElement> = EventObject & ClassAttribute & DatasetObject & StyleObject & ValueAttribute<E> & ContentAttribute & GenericAttribute;

/**
 * A Document Object, or DOM Object that represents changes to apply to existing elements
 * 
 * - properties of this object will be applied to the element
 * - properties starting with on will be treated as event listeners
 * - properties starting with data- will be treated as data attributes
 * - the style property will be used to set the element's style
 * - the class property will be used to set or clear class names
 * - the value property will be treated as value
 * - innerHTML, innerText, textContent and appendHTML properties will trigger corresponding functionality
 * - all other properties will be treated as generic attributes 
 */
export interface BaseDocumentObject {
    class?: ClassAttribute;
    dataset?: DatasetObject;
    style?: StyleObject;

    // disabled?: RMLTemplateExpressions.BooleanAttributeValue<'disabled'>;
    // readonly?: RMLTemplateExpressions.BooleanAttributeValue<'readonly'>;
    // open?: RMLTemplateExpressions.BooleanAttributeValue<'open'>;

    innerHTML?: MaybeFuture<HTMLString>;
    appendHTML?: MaybeFuture<HTMLString>;
    innerText?: MaybeFuture<HTMLString>;
    textContent?: MaybeFuture<HTMLString>;

    value?: string | MaybeFuture<string>;
};

export type BooleanAttributesMap = {
    [K in BooleanAttribute]: RMLTemplateExpressions.BooleanAttributeValue<K>;
};

/**
 * Attribuend, or DOM Object, or Document Object
 * A simple record of valid DOM attributes including class or style, plus event handlers or anything that can be set as an attribute of an element
 **/
export type DocumentObject = BaseDocumentObject & EventObject & BooleanAttributesMap & GenericAttribute;
