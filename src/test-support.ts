import { innerHTMLSink } from "./sinks/content-sink";
import { RMLEventAttributeName } from "./types/dom";

export interface MockElement extends HTMLElement, HTMLInputElement {
    dataset: DOMStringMap;
    style: CSSStyleDeclaration;
    value: string;
    innerText: string;
    innerHTML: string;
    textContent: string;
    readonly?: string;
    selectedIndex?: number;
    setAttribute(name: string, value: string): void;
    getAttribute(name: string): string | null;
    removeAttribute(name: string): void;
    className: string;
    insertAdjacentHTML(pos: InsertPosition, html: string): void;
    addEventListener(eventName: string, handler: EventListenerOrEventListenerObject): void;
    removeEventListener(eventName: string, handler: EventListenerOrEventListenerObject): void;
    dispatchEvent(event: Event): boolean;
};

export const MockElement = (props?: Record<string, any>): MockElement => {
    const el = <MockElement>{
        'dataset': {},
        'style': {},
        'textContent': '',
        'innerText': '',
        'innerHTML': '',
        'value': '',
        setAttribute(name: string, value: string) {
            this[name] = value;
        },
        getAttribute(name: string) {
            return this[name];
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
            }
        },
        insertAdjacentHTML(pos: InsertPosition, html: string) {
            if(pos === 'beforeend')
                el.innerHTML += html
            else if(pos === 'afterbegin')
                el.innerHTML = html + el.innerHTML            
        },
        addEventListener(eventName: string, handler: EventListenerOrEventListenerObject) {
            el[`on${eventName}` as keyof RMLEventAttributeName] = handler;
        },
        dispatchEvent(event: Event) {
            if(el[`on${event.type}` as keyof RMLEventAttributeName])
                el[`on${event.type}` as keyof RMLEventAttributeName](event);
        },
        ...props,
    };

    return el;
};
