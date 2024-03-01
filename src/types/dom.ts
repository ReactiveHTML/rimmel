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
export type RMLEventAttributeName = HTMLEventName & 'onmount';

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

interface EventListenerObject {
    handleEvent(e: Event): void;
}

export type EventListener = EventListenerFunction | EventListenerObject | undefined;
