import { debug } from "console";
import { RESOLVE_SELECTOR } from "./constants";
import { Rimmel_Bind_Subtree, Rimmel_Mount } from "./lifecycle/data-binding";
import { HTMLString } from "./types/dom";
import { BehaviorSubject, Subject } from "rxjs";

export type CustomElementDefinition = {
    observedAttributes?: string[]
    render?: (this: HTMLElement, props: Record<string, any>) => void;
    connectedCallback?: (this: HTMLElement) => void;
    disconnectedCallback?: (this: HTMLElement) => void;
    attributeChangedCallback?: (this: HTMLElement, name: string, oldValue: string, newValue: string) => void;
}

export type Inputs = Record<string, any>;
export type Effects = Record<string, any>;
export type RimmelComponent = (inputs: Inputs, effects?: Effects) => HTMLString;

const SubjectProxy = (defaults: Record<string | symbol, any> = {}) => {
    const subjects = <Record<string | symbol, BehaviorSubject<unknown> | Subject<unknown>>>{};
    return new Proxy({}, {
        get(_target, prop) {
            return subjects[prop] ?? (subjects[prop] = prop in defaults ? new BehaviorSubject(defaults[prop]) : new Subject());
        }
    });
};

class RimmelElement extends HTMLElement {
    component: RimmelComponent;
    attrs: Inputs;
    #inputs: Inputs;
    #effects?: Effects;
    #externalMutationObserver?: MutationObserver;
    #internalMutationObserver?: MutationObserver;

    constructor(component: RimmelComponent) {
        super();
        this.component = component;
        this.attachShadow({ mode: 'open' });
        // const [inputs, events] = [...this.attributes].reduce((a, b) => {
        //     a[+b.nodeName.startsWith('on')][b.nodeName] = b.nodeValue
        //     return a;
        // },[{}, {}]);
        const attrs = Object.fromEntries(
            [...this.attributes].map(b => [b.nodeName, b.nodeValue])
        );
        this.attrs = SubjectProxy(attrs);
        this.#inputs = SubjectProxy();
    }

    connectedCallback() {
        // Monitor for attribute changes on the custom element
        this.#externalMutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                const k = <string>mutation.attributeName;
                const v = this.getAttribute(k);
                this.attrs[k].next(v);
            });
        });
        this.#externalMutationObserver.observe(this, { attributes: true, childList: false, subtree: false });

        // Monitor for all other (RML) changes within the custom element, for data binding
        this.#internalMutationObserver = new MutationObserver(Rimmel_Mount);
        this.#internalMutationObserver.observe(this, { attributes: false, childList: true, subtree: true });
        this.render();
        [...this.shadowRoot?.children ?? [], ...this.shadowRoot!.querySelectorAll(RESOLVE_SELECTOR)]
            .forEach(Rimmel_Bind_Subtree)
        ;
    }

    attributeChangedCallback() {
        this.render();
    }

    disconnectedCallback() {
        this.#externalMutationObserver!.disconnect();
        this.#internalMutationObserver!.disconnect();
    }

    render() {
        this.shadowRoot!.innerHTML = this.component(this.attrs);
    }
};


export const DefineCustomElement = (tagName: string, component: RimmelComponent) => {

    class CustomRimmelElement extends RimmelElement {
        constructor() {
            super(component);
        }
    }

    // FIXME: prevent redefinition...
    customElements.define(tagName, CustomRimmelElement);
};
