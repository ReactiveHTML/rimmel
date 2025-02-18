import { isSinkBindingConfiguration, isSourceBindingConfiguration, type Inputs, type RimmelComponent } from './types/internal';
import type { SourceBindingConfiguration, SinkBindingConfiguration } from "./types/internal";

import { RESOLVE_SELECTOR } from "./constants";
import { Rimmel_Bind_Subtree, Rimmel_Mount } from "./lifecycle/data-binding";
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

const camelCase = (s: string) => s.split('-').map((s,i)=>i?s[0].toLocaleUpperCase()+s.slice(1):s).join('');

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

const SubjectProxy2 = (initials = {}, sources: Record<string | symbol, Observable<any>> = {}) => {
	//const subjects = <Record<string | symbol, BehaviorSubject<unknown> | Subject<unknown>>>;
	const subjects = new Map();

	return new Proxy(sources, {
		get(_target, prop) {
			return _target[prop] ?? subjects.get(prop) ?? subjects.set(prop, prop in initials ? new BehaviorSubject(initials[prop]) : new Subject()).get(prop);
		}
	});
};

class RimmelElement extends HTMLElement {
	component?: RimmelComponent;
	attrs: Inputs;
	#externalMutationObserver?: MutationObserver;
	#internalMutationObserver?: MutationObserver;
	extSinks: {};
	extSources: {};
	bindings: {};

	constructor(component?: RimmelComponent, initFn?: Function) {
		super();

		if(component) {
			this.component = component;
			// this.#events = {};
			const shadow = this.attachShadow({ mode: 'open' });
			// shadow.adoptedStyleSheets = [...];
		}

		const [attrs, events] = [...(<RMLNamedNodeMap>this.attributes)].reduce((acc, b) => {
			const isEvent = <0 | 1>+b.nodeName.startsWith('on');
			const t = acc[isEvent];
			t[isEvent ? b.nodeName : camelCase(b.nodeName)] = b.nodeValue!;
			return acc;
		}, [{}, {}] as [Record<string, string>, Record<string, string>]);

		const refs = waitingElementHanlders.get((this.attributes as RMLNamedNodeMap).resolve?.nodeValue ?? '') ?? [];
		this.attrs = SubjectProxy(attrs);

		if(refs) {
			Object.keys(events)
				.map(name => (<SourceBindingConfiguration<any>[]>refs).find(x => isSourceBindingConfiguration(x)))
				.filter(f=>!!f)
				.forEach(f => {
					subscribe(this, this.attrs[f.eventName], f.listener)
				})
			;

			const sinkBindingConfigurations = refs.filter(r => isSinkBindingConfiguration(r));

			this.extSinks = Object.fromEntries(
				sinkBindingConfigurations
				// .map(s => {[s.t]: s.sink = hijack?...
				.map((s: SinkBindingConfiguration<any>) => [camelCase(s.t), s.source])
			);

			this.extSources = Object.fromEntries(
				sinkBindingConfigurations
				// .map(s => {[s.t]: s.sink = hijack?...
				.map((s: SinkBindingConfiguration<any>) => [s.t, s.sink])
			);

			this.bindings = Object.fromEntries(
				refs.map(s =>
					isSinkBindingConfiguration(s)
						? [s.t, s.source ]
						: [(s as SourceBindingConfiguration<any>).eventName, (s as SourceBindingConfiguration<any>).listener ]
				)
			);
		}

		if(initFn) {
			debugger;
			//initFn?.(this, this.attrs, extSinks);
			// FIXME: maybe too much stuff merged in?
			const attributeProxy = SubjectProxy2(attrs, this.extSinks);
			initFn?.(this, attributeProxy);
			// initFn?.(this, { ...attrs, ...this.attrs, ...this.extSinks });
		}
	}

	render() {
		this.shadowRoot!.innerHTML = this.component(this.attrs);
	}

	connectedCallback() {
		// Monitor for attribute changes on the custom element
		this.#externalMutationObserver = new MutationObserver((mutations) => {
			mutations.forEach(mutation => {
				const k = <string>mutation.attributeName;
				const v = this.getAttribute(k);
				this.attrs[k].next(v);
				//this.bindings[k]?.next?.(v);
				this.extSources[k]?.next?.(v);
			});
		});
		this.#externalMutationObserver.observe(this, { attributes: true, childList: false, subtree: false });

		// Monitor for all other (RML) changes within the custom element, for data binding
		this.#internalMutationObserver = new MutationObserver(Rimmel_Mount);
		this.#internalMutationObserver.observe(this, { attributes: false, childList: true, subtree: true });

		if(this.component) {
			this.render();
			[...this.shadowRoot?.children ?? [], ...this.shadowRoot!.querySelectorAll(RESOLVE_SELECTOR)]
				.forEach(s => {
					Rimmel_Bind_Subtree(s)
				})
			;
		}
	}

//	attributeChangedCallback() {
//		// FIXME: what's this?
//		this.render();
//	}

	disconnectedCallback() {
		// AKA: unmount
		this.#externalMutationObserver?.disconnect();
		this.#internalMutationObserver?.disconnect();
	}
};

/**
 * Register a Rimmel Component as a Custom Element in the DOM
 *
 * ## Examples
 *
 * ### Create a simple "Hello, World" web component
 *
 * ```ts
 * import { rml, RegisterElement } from 'rimmel';
 *
 * RegisterElement('custom-element', () => {
 *   return rml`
 *     <h1>Hello, world</h1>
 *   `;
 * }
 * ```
 *
 **/
export const RegisterElement = (tagName: string, component?: RimmelComponent, initFn?: Function) => {
	// FIXME: prevent redefinition...
	// TODO: UnregisterElement?
	customElements.define(tagName, class extends RimmelElement {
		constructor() {
			super(component, initFn);
		}
	});
};

