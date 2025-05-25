import type { BooleanAttribute } from "../definitions/boolean-attributes";
import type { CSSClassName, CSSObject, CSSValue } from "./style";
import type { CSSString, EventListenerOrEventListenerObject, EventType, HTMLString } from "./dom";
import type { Future, MaybeFuture, Observable, Observer, Subject } from "./futures";
import type { RenderingScheduler } from "./schedulers";
import type { RMLEventName, RMLEventAttributeName } from "./dom";
import type { Sink } from "./sink";

import { ObjectSourceExpression, TargetObject } from "../sources/object-source";
import { isFunction } from "../utils/is-function";
import { isObserverSource } from "../sources/observer-source";

export type ErrorHandler = (e: Error) => void;

/**
 * Data binding configuration for event sources or data sinks
 *
 * @remarks Used to describe a binding between a source and a sink when mounting a template
 * effectively telling Rimmel where to bind what on mount
 */
export interface BindingConfiguration {
	type: 'source' | 'sink';
};

/**
 * This tells Rimmel how to bind an EventTarget to an event handler.
 *
 * Objects of this type are normally returned by Source functions
 */
export interface SourceBindingConfiguration<T extends RMLEventName> {
	type: 'source';
	listener: EventListenerOrEventListenerObject<EventType<T>>;
	options?: AddEventListenerOptions;
	eventName: RMLEventName;
	// error?: EventListener;
	// termination?: EventListener;
};

/**
 * This tells Rimmel how to sink a Promise or an Observable to the DOM.
 * Objects of this type are normally returned by Sink functions, or chosen
 * automatically by the Rimmel parser based on the context
 * ## Examples
 *
 * ### Set the value of a textbox from a Promise
 *
 * Here when the Promise resolves, the value of the text box will be set
 *
 * ```ts
 * const p = new Promise(resolve => setTimeout(() =>resolve('hello'), 2000));
 * const template = rml`
 *   <input value="${p}">
 * `;
 */
export interface SinkBindingConfiguration<E extends Element> extends BindingConfiguration {
	type: 'sink';
	t: string;
	source: Future<unknown>;
	sink: Sink<E>;
	scheduler?: RenderingScheduler;
	params?: any;
	error?: ErrorHandler;
	termination?: () => void;
};

// export type Empty = MaybeFuture<undefined | null | ''>;
// export type BindingConfigurationType<T> = T extends SinkBindingConfiguration<infer Q> ? SinkBindingConfiguration<Q> : SourceBindingConfiguration<infer Z>;
export const isSinkBindingConfiguration = (b: unknown): b is SinkBindingConfiguration<any> => (b as SinkBindingConfiguration<any>).type == 'sink';
export const isSourceBindingConfiguration = (b: unknown): b is SourceBindingConfiguration<any> => (b as SourceBindingConfiguration<any>).type == 'source';

export const isSourceExpression = <T>(e: unknown): e is RMLTemplateExpressions.SourceExpression<T> => isFunction(e) || isObserverSource(e);
/**
 * An Object's property or an Array's index
 */
export type property = string | number | symbol;
export type QuerySelectorString = string;
export type SourceAttributeName = RMLEventAttributeName;
export type SinkAttributeName<T = string> = T extends RMLEventAttributeName ? never : string;
export type AttributeName = SourceAttributeName | SinkAttributeName;

export type SinkAttributeValue = boolean | string | number | Promise<any> | Observable<any> | null | undefined;
export type SourceAttributeValue = Observer<any> | Function;
export type AttributeValue = SinkAttributeValue | SourceAttributeValue;
export type AttributeObject = {
	[K in string]: K extends SourceAttributeName ? SourceAttributeValue : SinkAttributeValue;
};
export type DOMSubtreeObject = {
	[K in QuerySelectorString]: AttributeObject;
};

export namespace RMLTemplateExpressions {
	/**
	 * An HTML Subtree
	 */
	export type Node = MaybeFuture<HTMLString>;
	/**
	 * The value of an HTML attribute
	 */
	export type AttributeValue = MaybeFuture<number | string | boolean>;
	/**
	 * The value of a boolean HTML attribute
	 */
	// export type BooleanAttributeValue = MaybeFuture<boolean | 'true' | (typeof BOOLEAN_ATTRIBUTES extends Set<infer T> ? T : never)>;
	// export type BooleanAttributeValue<T extends keyof typeof BOOLEAN_ATTRIBUTES> = MaybeFuture<boolean | T | 'true'>;
	// export type BooleanAttributeValue<T extends keyof typeof BOOLEAN_ATTRIBUTES> = MaybeFuture<boolean | T | 'true'>;
	// export type BooleanAttributeValue = BooleanAttribute;
	export type BooleanAttributeValue<T extends BooleanAttribute> = MaybeFuture<boolean | T | 'true'>;

	export type EnumAttributeValue<T extends 'hidden'> = MaybeFuture<T | boolean | 'true' | 'false' | 'until-found'>;


	/**
	 * One or more class names
	 */
	export type ClassName = MaybeFuture<CSSClassName | CSSClassName[]>;
	/**
	 * A Record of class names to set or clear
	 */
	export type ClassObject = MaybeFuture<Record<CSSClassName, boolean>>;

	/**
	 * A simple HTML string or a Future resolving to it
	 */
	export type HTMLText = MaybeFuture<HTMLString>;
	export type TextString = MaybeFuture<string | number>;
	export type StringLike = MaybeFuture<string | number | Array<string | number>>;

	export type POJO = ObjectSourceExpression<TargetObject>;
	/**
	 * A CSS declaration "property: value;" string
	 */
	export type CSSStyleDeclaration = MaybeFuture<CSSString | CSSObject>;
	export type CSSStyleValue<T extends keyof CSSStyleDeclaration> = MaybeFuture<CSSValue<T>>;
	export type Mixin<E extends Element = Element> = MaybeFuture<AttributeObject>;
	export type EventHandler<T extends RMLEventName = any> = EventListenerOrEventListenerObject<EventType<T>> | Observer<EventType<T>>;
	export type GenericHandler = BindingConfiguration;

	// Implicit Source
	export type SourceExpression<T> = Observer<T> | ((t: T) => void);

	export type SinkExpression = Sink<Element | Text>;
	// export type Empty = MaybeFuture<undefined | null | ''>;

	export type TargetEventHandler<T> =
		| ((data: T) => void)
		| Observer<T>
		;

	/**
	 * A valid RML template expression which can be:
	 * - a static value, when no data binding is required (e.g.: a string)
	 * - an event handler function
	 * - an event handler object
	 * - an event handler stream (e.g.: an Observer)
	 * - a custom event source
	 * - a data sink
	**/
	export type Any =
		| Node
		| AttributeValue
		| BooleanAttributeValue<any>
		| ClassName
		| ClassObject
		| CSSStyleDeclaration
		// | CSSStyleValue
		| Mixin
		| EventHandler
		| POJO
	;
};

export type RMLTemplateExpression =
	| RMLTemplateExpressions.AttributeValue
	| RMLTemplateExpressions.BooleanAttributeValue<any>
	| RMLTemplateExpressions.ClassName
	| RMLTemplateExpressions.ClassObject
	| RMLTemplateExpressions.CSSStyleDeclaration
	// | RMLTemplateExpressions.CSSStyleValue<T extends keyof CSSStyleDeclaration>
	| RMLTemplateExpressions.EventHandler
	| RMLTemplateExpressions.HTMLText
	| RMLTemplateExpressions.HTMLText[]
	| RMLTemplateExpressions.TextString
	| RMLTemplateExpressions.TextString[]
	| RMLTemplateExpressions.Mixin
	| RMLTemplateExpressions.Node
	| RMLTemplateExpressions.POJO
	| BindingConfiguration
;

/**
 * A RML template expression
 *
 * This includes anything that can be passed in RML templates
 */
export type Handler<E extends Element, T extends RMLEventName = any> =
	| undefined
	| number
	| string
	| boolean
	// | ObjectSourceExpression
	| Record<AttributeName, AttributeValue>
	| CSSClassName
	| Function
	| Sink<E>
	| Subject<EventType<T>>
	| Observable<unknown>
	| Promise<unknown>
	| Observer<unknown>
	| BindingConfiguration
;

export type Inputs = Record<string, RMLTemplateExpression>;
export type Effects = Record<string, any>;
/**
 * A Rimmel Component
 *
 * A plain function that takes an object of named input parameters and returns an HTML string
 * @param inputs also referred to as "Props" in other frameworks, a simple object containing all parameters of the Component. Those can be static values, Promises, Observables, Event Handlers, literally anything the Component wants to use
 **/
export type RimmelComponent = (inputs: Inputs) => HTMLString;

