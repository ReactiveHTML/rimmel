import { RMLEventAttributeName } from "./types/dom";

type HTMLEventSource = {
    [key in RMLEventAttributeName]?: any;
}

export interface MockElement extends HTMLElement {
    dataset: DOMStringMap;
    checked?: boolean;
    disabled?: boolean;
    style: CSSStyleDeclaration;
    value: string;
    innerText: string;
    innerHTML: string;
    textContent: string;
    readOnly?: boolean;
    remove: () => void;
    selectedIndex?: number;
    setAttribute(name: string, value: string): void;
    getAttribute(name: string): string | null;
    hasAttribute: (name: string) => boolean;
    removeAttribute(name: string): void;
    className: string;
    insertAdjacentHTML(pos: InsertPosition, html: string): void;
    addEventListener(eventName: string, handler: EventListenerOrEventListenerObject): void;
    removeEventListener(eventName: string, handler: EventListenerOrEventListenerObject): void;
    dispatchEvent(event: Event): boolean;
    childNodes: NodeListOf<ChildNode>;
};

export const MockElement = (props?: Record<string, any>): MockElement => {
    const el = <MockElement>{
        'focus': () => {},
        'blur': () => {},
        'dataset': {},
        'style': {},
        'tagName': 'MOCKELEMENT',
        'textContent': '',
        'innerText': '',
        'innerHTML': '',
        'value': '',
        remove: () => {},
        setAttribute(name: string, value: string) {
            this[name] = value;
        },
        getAttribute(name: string) {
            return this[name];
        },
        hasAttribute(name: string) {
            return this[name] !== undefined;
        },
        removeAttribute(name: string) {
            delete this[name];
        },
        className: '',
        classList: {
            add(name: string) {
                el.className = el.className.split(' ').filter(x => x !== name).concat(name).join(' ');
            },
            remove(name: string) {
                el.className = el.className.split(' ').filter(x => x !== name).join(' ');
            },
            toggle(name: string) {
                el.className.includes(name)
                    ? el.classList.remove(name)
                    : el.classList.add(name)
                ;
            },
        },
        insertAdjacentHTML(pos: InsertPosition, html: string) {
            if(pos === 'beforeend')
                el.innerHTML += html
            else if(pos === 'afterbegin')
                el.innerHTML = html + el.innerHTML
        },
        addEventListener(eventName: string, handler: EventListenerOrEventListenerObject) {
            (<HTMLEventSource>el)[`on${eventName}` as RMLEventAttributeName] = handler;
        },
        dispatchEvent(event: Event) {
            (<HTMLEventSource>el)[`on${event.type}` as RMLEventAttributeName]?.(event);
        },
        childNodes: [] as NodeListOf<ChildNode>,
        ...props,
    };

    return el;
};

export const MockEvent = <E extends Event>(name: string, data: Partial<E>) =>
 (<E>{
   bubbles: true,
   cancelable: true,
   currentTarget: null,
   defaultPrevented: false,
   eventPhase: 0,
   isTrusted: false,
   target: null,
   preventDefault: () => {},
   stopPropagation: () => {},
   timeStamp: 0,
   type: name,
   ...data,
 });

// Sink binding configuration test helper
export const expectSinkBindingConfiguration = (
    config: any,
    expectedType: string,
    expectedTag: string,
    expectedSource: any,
    expectedSink: any
) => {
    expect(config.type).toBe(expectedType);
    expect(config.t).toBe(expectedTag);
    expect(config.source).toBe(expectedSource);
    expect(config.sink).toBe(expectedSink);
};
