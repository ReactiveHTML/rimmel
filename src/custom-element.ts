import type { Inputs, RimmelComponent, SourceBindingConfiguration, SinkBindingConfiguration } from './types/internal';
import type { Future } from './types/futures';
import type { Sink } from './types/sink';

import { RESOLVE_SELECTOR } from "./constants";
import { isSinkBindingConfiguration, isSourceBindingConfiguration } from './types/internal';
import { Rimmel_Bind_Subtree, Rimmel_Mount } from "./lifecycle/data-binding";
import { subscribe } from "./lib/drain";
import { waitingElementHandlers } from "./internal-state";

import { BehaviorSubject, Subject } from "rxjs";
import { camelCase } from './utils/camelCase';

export type CustomElementDefinition = {
	observedAttributes?: string[]
	render?: (this: HTMLElement, props: Record<string, any>) => void;
	connectedCallback?: (this: HTMLElement) => void;
	disconnectedCallback?: (this: HTMLElement) => void;
	attributeChangedCallback?: (this: HTMLElement, name: string, oldValue: string, newValue: string) => void;
}

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

const SubjectProxy2 = (initials: Record<string | symbol, any> = {}, sources: Record<string | symbol, Future<any>> = {}) => {
	//const subjects = <Record<string | symbol, BehaviorSubject<unknown> | Subject<unknown>>>;
	const subjects = new Map<string | symbol, Subject<any>>();

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
	#lightMutationObserver?: MutationObserver;
	#shadowMutationObserver?: MutationObserver;
	extSinks?: Record<string | symbol, Future<any>>;
	/**
	 * Attributes on the external HTML element
	 */
	externalSourceAttributes?: Record<string, Sink<any>>;
	bindings?: {};

	constructor(component?: RimmelComponent, initFn?: Function) {
		super();

		if(component) {
			this.component = component;
			// this.#events = {};
			const shadow = this.attachShadow({ mode: 'open' });
			// shadow.adoptedStyleSheets = [...];
		}

		const [attrs, events] = [...(<RMLNamedNodeMap>this.attributes)].reduce((acc, b) => {
			// FIXME: REF0000266279391633 this is an awful way to look up leftover event handlers from the parser.
			const isEvent = <0 | 1>+/^_?on/.test(b.nodeName);
			const t = acc[isEvent];
			t[isEvent ? b.nodeName : camelCase(b.nodeName)] = b.nodeValue!;
			return acc;
		}, [{}, {}] as [Record<string, string>, Record<string, string>]);

		const refs = waitingElementHandlers.get((this.attributes as RMLNamedNodeMap).resolve?.nodeValue ?? '') ?? [];
		this.attrs = SubjectProxy(attrs);

		// This condition holds for non-virtual custom elements. Won't be needed anymore if we split web components from virtual web components
		if(refs.length) {
			// Connect/Bind Outbound Events
			Object.keys(events)
				.map(name => (<SourceBindingConfiguration<any>[]>refs).find(x => isSourceBindingConfiguration(x)))
				.filter(f=>!!f)
				.forEach(f => {
					// TODO: store subscription for later removal
					const subscription = subscribe(this, this.attrs[`on${f.eventName}`], f.listener)
				})
			;

			const sinkBindingConfigurations = refs.filter(r => isSinkBindingConfiguration(r));

			this.extSinks = Object.fromEntries(
				sinkBindingConfigurations
				// .map(s => {[s.t]: s.sink = hijack?...
				.map((s: SinkBindingConfiguration<any>) => [camelCase(s.t), s.source])
			);

			// Inbound Attributes
			this.externalSourceAttributes = Object.fromEntries(
				sinkBindingConfigurations
				// .map(s => {[s.t]: s.sink = hijack?...
				.map((s: SinkBindingConfiguration<any>) => [s.t, s.sink])
			);

			// Outbound Events
			this.bindings = Object.fromEntries(
				refs.map(s =>
					isSinkBindingConfiguration(s)
						? [s.t, s.source ]
						: [(s as SourceBindingConfiguration<any>).eventName, (s as SourceBindingConfiguration<any>).listener ]
				)
			);

			if(initFn) {
				//initFn?.(this, this.attrs, extSinks);
				// FIXME: maybe too much stuff merged in?
				const attributeProxy = SubjectProxy2(attrs, this.extSinks);
				initFn?.(this, attributeProxy);
				// initFn?.(this, { ...attrs, ...this.attrs, ...this.extSinks });
			}
		}
	}

	render() {
		this.shadowRoot!.innerHTML = this.component!(this.attrs);
	}

	connectedCallback() {
		// Monitor for attribute changes on the custom element
		this.#externalMutationObserver = new MutationObserver((mutations) => {
			mutations.forEach(mutation => {
				const k = <string>mutation.attributeName;
				const v = this.getAttribute(k);
				this.attrs[k].next(v);
				//this.bindings[k]?.next?.(v);
				// debugger;
				// this.externalSourceAttributes?.[k]?.next?.(v);

				// ---
				// Set the attribute on the custom element
				// Actually, don't, as it would cause an infinite loop
				// with this same mutationObserver...
				// Shall we just make it ignore self-originated changes
				// or should we just not set the attribute?
				// const sink = this.externalSourceAttributes?.[k];
				// sink?.(this)(v);
			});
		});
		this.#externalMutationObserver.observe(this, { attributes: true, childList: false, subtree: false });

		// Monitor for all other (RML) changes within the custom element, for data binding
		this.#lightMutationObserver = new MutationObserver(Rimmel_Mount);
		this.#lightMutationObserver.observe(this, { attributes: false, childList: true, subtree: true });

		
		if(this.shadowRoot) {
			this.#shadowMutationObserver = new MutationObserver(Rimmel_Mount);
			this.#shadowMutationObserver.observe(this.shadowRoot, { attributes: false, childList: true, subtree: true });
		}

		if(this.component) {
			this.render();
			[...this.shadowRoot?.children ?? [], ...this.shadowRoot!.querySelectorAll(RESOLVE_SELECTOR)]
				.forEach(s => {
					Rimmel_Bind_Subtree(s)
				})
			;
		}
	}

	disconnectedCallback() {
		// AKA: unmount
		this.#externalMutationObserver?.disconnect();
		this.#lightMutationObserver?.disconnect();
		this.#shadowMutationObserver?.disconnect();
	}
};

/**
 * Register a Rimmel Component as a Custom Element in the DOM
 *
 * ## Examples
 *
 * ### Create a simple "Hello, World" web component
 * ```ts
 * import { rml, RegisterElement } from 'rimmel';
 *
 * RegisterElement('custom-element', () => {
 *   return rml`
 *     <h1>Hello, world</h1>
 *   `;
 * }
 * ```
 **/
export const RegisterElement = (tagName: string, component: RimmelComponent | null | undefined, initFn?: Function) => {
	// FIXME: prevent redefinition...
	// TODO: UnregisterElement?
	customElements.define(tagName, class extends RimmelElement {
		constructor() {
			super(component, initFn);
		}
	});
};
