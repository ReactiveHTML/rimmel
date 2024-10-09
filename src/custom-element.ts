import { RESOLVE_SELECTOR } from "./constants";
import { SourceBindingConfiguration } from "./types/internal";
import { Rimmel_Bind_Subtree, Rimmel_Mount } from "./lifecycle/data-binding";
import { HTMLString } from "./types/dom";
import { subscribe } from "./lib/drain";
import { waitingElementHanlders } from "./internal-state";

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
interface RMLNamedNodeMap extends NamedNodeMap {
	resolve: Attr;
}

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
	// #inputs: Inputs;
	// #effects?: Effects;
	// #events?: Effects;
	#externalMutationObserver?: MutationObserver;
	#internalMutationObserver?: MutationObserver;

	constructor(component: RimmelComponent) {
		super();
		this.component = component;
		// this.#events = {};
		this.attachShadow({ mode: 'open' });

		const [attrs, events] = [...(<RMLNamedNodeMap>this.attributes)].reduce((a, b) => {
			const isEvent = <0 | 1>+b.nodeName.startsWith('on');
			const t = a[isEvent];
			t[b.nodeName] = b.nodeValue!;
			return a;
		}, [{}, {}] as [Record<string, string>, Record<string, string>]);

		const refs = waitingElementHanlders.get((this.attributes as RMLNamedNodeMap).resolve.nodeValue ?? '');
		this.attrs = SubjectProxy(attrs);

		refs && Object.keys(events)
			.forEach(eventName => {
				const f = (<SourceBindingConfiguration<any>[]>refs).find(x=>`on${x.eventName}` == eventName);
				f && subscribe(this, this.attrs[eventName], f.listener);
			})
		;
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
		.forEach(s => {
			//debugger;
			Rimmel_Bind_Subtree(s)
		})
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

export const RegisterElement = (tagName: string, component: RimmelComponent) => {
	// FIXME: prevent redefinition...
	// TODO: UnregisterElement?
	customElements.define(tagName, class extends RimmelElement {
		constructor() {
			super(component);
		}
	});
};

