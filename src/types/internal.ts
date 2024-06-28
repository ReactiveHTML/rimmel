import { POJOSourceExpression } from "../sources/pojo-source";
import { CSSString, EventListenerOrEventListenerObject, EventType, HTMLString  } from "./dom";
import { RMLEventName } from "./dom";
import { Future, MaybeFuture, Observable, Observer, Subject } from "./futures";
import { isFunction } from "../utils/is-function";
import { isObserverSource } from "../sources/observer-source";
import { Sink } from "./sink";
import { CSSClassName, CSSObject, CSSValue } from "./style";

/**
 * Data binding configuration for event sources or data sinks
 * Used to describe a binding between a source and a sink when mounting a template
 */
export interface BindingConfiguration {
	type: 'source' | 'sink';
}

/**
 * Binding configuration for an event source
 */
export interface SourceBindingConfiguration<T extends RMLEventName> {
	type: 'source';
	listener: EventListenerOrEventListenerObject<EventType<T>>;
	eventName?: RMLEventName;
	// error?: EventListener;
	// termination?: EventListener;
}

/**
 * Binding configuration for an event source
 */
export interface SinkBindingConfiguration<E extends Element> extends BindingConfiguration {
	type: 'sink';
	source: Future<unknown>;
	sink: Sink<E>;
	params?: any;
	error?: EventListener;
	termination?: EventListener;
}

	// export type Empty = MaybeFuture<undefined | null | ''>;
// export type BindingConfigurationType<T> = T extends SinkBindingConfiguration<infer Q> ? SinkBindingConfiguration<Q> : SourceBindingConfiguration<infer Z>;
export const isSinkBindingConfiguration = (b: BindingConfiguration): b is SinkBindingConfiguration<any> => b.type == 'sink';
export const isSourceBindingConfiguration = (b: BindingConfiguration): b is SourceBindingConfiguration<any> => b.type == 'source';

export const isSourceExpression = <T>(e: unknown): e is SourceExpression<T> => isFunction(e) || isObserverSource(e);
/**
 * An Object's property or an Array's index
 */
export type property = string | number | symbol;

export type AttributeName = string;
export type AttributeValue = boolean | string | number | Function | Promise<any> | Observable<any>;
export type AttributeObject = Record<AttributeName, AttributeValue>;

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
	export type BooleanAttributeValue = MaybeFuture<boolean | unknown>;
	/**
	 * One or more class names
	 */
	export type ClassName = MaybeFuture<CSSClassName | CSSClassName[] | Record<CSSClassName, boolean>>;
	/**
	 * A Record of class names to set or clear
	 */
	export type ClassObject = MaybeFuture<Record<CSSClassName, boolean>>;

	export type HTML = MaybeFuture<HTMLString>;
	export type Text = MaybeFuture<string>;

	export type POJO = POJOSourceExpression;
	/**
	 * A CSS declaration "property: value;" string
	 */
	export type CSSStyleDeclaration = MaybeFuture<CSSString | CSSObject>;
	export type CSSStyleValue<T extends keyof CSSStyleDeclaration> = MaybeFuture<CSSValue<T>>;
	export type Mixin<E extends Element = Element> = MaybeFuture<AttributeObject>;
	export type EventHandler<T extends RMLEventName = any> = EventListenerOrEventListenerObject<EventType<T>> | Observer<EventType<T>>;
	export type GenericHandler = BindingConfiguration;

	// Implicit Source
	export type SourceExpression<T> = Observable<T> | Observer<T> | Subject<T> | ((t: T) => any);

	export type SinkExpression = Sink<Element>;
	// export type Empty = MaybeFuture<undefined | null | ''>;

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
		| BooleanAttributeValue
		| ClassName
		| ClassObject
		| CSSStyleDeclaration
		| CSSStyleValue
		| Mixin
		| EventHandler
		| POJO
	;
};

export type RMLTemplateExpression =
	| RMLTemplateExpressions.AttributeValue
	| RMLTemplateExpressions.BooleanAttributeValue
	| RMLTemplateExpressions.ClassName
	| RMLTemplateExpressions.ClassObject
	| RMLTemplateExpressions.CSSStyleDeclaration
	// | RMLTemplateExpressions.CSSStyleValue<T extends keyof CSSStyleDeclaration>
	| RMLTemplateExpressions.EventHandler
	| RMLTemplateExpressions.HTML
	| RMLTemplateExpressions.Text
	| RMLTemplateExpressions.Mixin
	| RMLTemplateExpressions.Node
	| RMLTemplateExpressions.POJO
	| BindingConfiguration
;

/**
 * A RML template expression
 */
export type Handler<E extends Element, T extends RMLEventName=any> =
	| undefined
	| number
	| string
	| boolean
	| POJOSourceExpression
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
