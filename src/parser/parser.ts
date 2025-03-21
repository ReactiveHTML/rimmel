import type { AttributeObject, BindingConfiguration, RMLTemplateExpression, RMLTemplateExpressions, SinkBindingConfiguration, SourceBindingConfiguration } from "../types/internal";
import type { Sink } from "../types/sink";
import type { HTMLString, RMLEventAttributeName, RMLEventName } from "../types/dom";

import { isSinkBindingConfiguration, isSourceBindingConfiguration } from "../types/internal";

import { state, waitingElementHanlders } from "../internal-state";
import { isFunction } from "../utils/is-function";
import { takeFirstSync } from "../utils/take-first-sync";
import { BehaviorSubject, MaybeFuture, Observable } from "../types/futures";
import { BOOLEAN_ATTRIBUTES } from "../definitions/boolean-attributes";
import { INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, REF_TAG, RESOLVE_ATTRIBUTE, RML_DEBUG } from "../constants";

import { PreSink } from "../sinks/index";
import { sinkByAttributeName } from '../parser/sink-map';
import { DOMAttributePreSink, FixedAttributePreSink, WritableElementAttribute } from "../sinks/attribute-sink";
import { Mixin } from "../sinks/mixin-sink";
import { ObjectSource, ObjectSourceExpression, isObjectSource } from "../sources/object-source";
import { ObserverSource, isObserverSource, ObservatureSource, isObservatureSource } from "../sources/observer-source";

import { InnerHTML } from "../sinks/inner-html-sink";
import { TextContent } from "../sinks/text-content-sink";
import { ClassRecord } from "../sinks/class-sink";
import { StyleObjectSink, StylePreSink, STYLE_OBJECT_SINK_TAG } from "../sinks/style-sink";

export const addRef = (ref: string, data: BindingConfiguration) => {
	waitingElementHanlders.get(ref)?.push(data) ?? waitingElementHanlders.set(ref, [data]);
};

const getEventName = (eventAttributeString: RMLEventAttributeName): [RMLEventName, RMLEventAttributeName] | [] => {
	const x = /\s+(?<attr>(?<prefix>rml:)?on(?<event>\w+))=['"]?$/.exec(eventAttributeString)?.groups;
	return x ? [<RMLEventName>`${x.prefix??''}${x?.event}`, <RMLEventAttributeName>x.attr] : []
}

/**
 * rml — the main entry point for Rimmel.js
 *
 * rml is a tag function. You call it by tagging it with an ES6 template literal
 * of HTML text interleaved with references to any JavaScript entity that's in scope.
 *
 * By using components that use rml to return HTML strings, you have a monad you can use to compse a whole web application
 *
 * ## Example
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const num = 5;
 *
 *   return rml`
 *     <div>${number}</div>
 *   `;
 * };
 * ```
 *
 **/
export function rml(strings: TemplateStringsArray, ...expressions: RMLTemplateExpression[]): HTMLString {
	let acc = '';
	const strlen = strings.length -1;
	for(let i=0; i<strlen; i++) {
		const string = strings[i];
		const accPlusString = acc +string;
		const lastTag = accPlusString.lastIndexOf('<');
		const expression = expressions[i];
		const [ eventName, eventAttributeName ] = getEventName(string as RMLEventAttributeName);
		const r = (accPlusString).match(/<\w[\w-]*\s+[^>]*resolve="(?<existingRef>[^"]+)"\s*[^>]*(?:>\s*[^<]*|[^>]*)$/);
		const existingRef = r?.groups?.existingRef;
		const ref = existingRef ?? `${REF_TAG}${state.refCount++}`;

		// Determine in which template context is any given expression appearing
		// Then, depending on the context, call matching parser modules and (yet-to-be-created) registered parser plugins
		//const context =
		//	/>\s*$/.test(string) && /^\s*<\s*/.test(nextString) ? 'child/subtree'
		//	: /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString) ? 'attribute'

		// #IFDEF ENABLE_RML_DEBUGGER
		if(string.includes(RML_DEBUG)) {
			const nl = (str: string) => str.replace(/\t/g, '  ');
			const reducer = (str: string[], next: string, j: number) => str.concat(
				(j>0?'}':'') +nl(j==i ? next.replace(RML_DEBUG, `%c${RML_DEBUG}%c`) : next),
				j==i && next.includes(RML_DEBUG)
					? ['color: red', '']
					: [],
				(j<=strlen-1?'${':'') +(j<strlen ? expressions[j] : [])
			);
			const currentTemplate = strings.reduce(reducer, <string[]>[]);
			console.log(...currentTemplate);
			/* Stopped parsing a RML template */
			debugger;
		}
		// #ENDIF ENABLE_RML_DEBUGGER

		// We treat and render any null or undefined values as empty strings
		// as a graceful handling of non-values (should this be configurable for a better QA?)
		// const printableExpressionType = typeof expression ?? 'undefined';
		const printableExpressionType = typeof (expression ?? '');

		if(['string', 'number', 'boolean'].includes(printableExpressionType)) {
			// Static expressions, no data binding. Just concatenate
			acc = accPlusString +(expression ?? '');
		} else if(eventName) {
			// Event Source
			// so feed it to an Rx Subject | Observer | Handler Function | POJO | Array

			// TODO: support EventListenerObject
			// Use Cases:
			// <a onclick="${subject}">
			// <a onclick="${()=>doSomething}">
			// TODO: do we want the following?
			// <input type="text" onchange="${[object, 'attributeToSet']}">   will feed it the .value of the input field
			// <input type="text" onchange="${[array,  pos]}">    will feed it the .value of the input field

			// TODO: Shall we support arrays of streams to feed multiple subscriptions at once? (may conflict with the array syntax above?
			// <button onclick="${[stream1, stream2, stream3]}">    will feed each of the supplied streams?
			// or explicitly:
			// <button onclick="${Multi(stream1, stream2, stream3)}"> with "multi source"

			let listener;
			if(isSourceBindingConfiguration(expression)) {
				listener = expression.listener;
				addRef(ref, <SourceBindingConfiguration<typeof eventName>>{ ...expression, eventName });
			} else {
				listener =
					isObservatureSource(expression) ? ObservatureSource(expression)
					: isObserverSource(expression) ? ObserverSource(expression)
					: isFunction(expression) ? expression
					: isObjectSource(expression) ? ObjectSource(...(expression as ObjectSourceExpression<typeof expression[1]>))
					: null // We allow it to be empty. If so, ignore, and don't connect any source. Perhaps add a warning in debug mode?
				;

				if(listener) {
					addRef(ref, <SourceBindingConfiguration<typeof eventName>>{ type: 'source', listener, eventName });
				} // TODO: shall we add some notifications, otherwise, rather than silently ignore?
			}

			acc = accPlusString
				//.replace(new RegExp(`\\s${eventAttributeName}=(['"]?)$`), ` _${eventAttributeName}=$1`)
				.replace(/\s((?:rml:)?on\w+=['"]?)$/, ' _$1')
				+(!listener || existingRef ? '' : `${ref}" ${RESOLVE_ATTRIBUTE}="${ref}`);
		} else {
			// Data Sink.
			// Determine its type before connecting.

			// 	// Custom/user-defined sink
			// 	?????
			// 	addRef(ref, <RMLTemplateExpressions.GenericHandler>{ type: 'sink', sink: expression.sink });
			// 	// addRef(ref, expression);
			// 	acc = accPlusString.replace(/<(\w[\w-]*)\s*([^>]*)(>?)\s*$/, `<$1 ${existingRef?'':`resolve="${ref}" `}$2$3`);

			// // } else if(typeof ((<Observable<unknown>>expression).subscribe ?? (<Promise<unknown>>expression).then)  == 'function' && i<strings.length -1 || typeof expression == 'object') {
			// } else if(
			if(Array.isArray(expression)) {
				// If sinking an array, we're likely just mapping it
				acc = accPlusString +expression.join('');
			} else {
				// expression is a future or an object

				const nextString = strings[i+1];
				// if it's a BehaviorSubject or any other sync stream (e.g.: startWith operator), pick its initial/current value to render it synchronously
				const initialValue = (expression as BehaviorSubject<unknown>)?.value
					// ?? ((<RMLTemplateExpressions.SourceExpression<any>>expression).source && takeFirstSync((<Observable<any>>expression).source))
					// ?? takeFirstSync(expression)
				;

				const isAttribute = /(?<attribute>[:a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(accPlusString);
				// const isAttribute = /<[a-z][a-z0-9\-_]+\s+.*\s+(?<attribute>[:a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(accPlusString);
				if(isAttribute) {

					const quotationMarks = isAttribute.groups!.quote;
					if(new RegExp(`^(?:[^>${quotationMarks}]*)${quotationMarks}?`).test(nextString)) {

						// Attribute Sink
						// Use Cases:
						// <some-tag some-attributes another-attribute="${observable}" other-stuff></some-tag>
						// <some-tag some-attributes class="some classes ${observable} and more" other-stuff></some-tag>
						// <some-tag some-attributes data-xxx="123" data-yyy="${observable}" other-stuff></some-tag>

						let sink: Sink<HTMLElement | SVGElement>;
						let isBooleanAttribute = false;
						let handler: SinkBindingConfiguration<HTMLElement | SVGElement>;
						const attributeName = isAttribute.groups!.attribute;
						if(attributeName == 'style') {
							const CSSAttribute = /;?(?<key>[a-z\-][a-z0-9\-_]*)\s*:\s*$/.exec(string)?.groups?.key;
							sink = CSSAttribute ? StylePreSink(CSSAttribute): StyleObjectSink;
							handler = PreSink<HTMLElement | SVGElement>(STYLE_OBJECT_SINK_TAG, sink, expression, CSSAttribute);
						} else {
							isBooleanAttribute = BOOLEAN_ATTRIBUTES.has(attributeName);
							sink = (sinkByAttributeName.get(attributeName) ?? (isBooleanAttribute && DOMAttributePreSink(<WritableElementAttribute>attributeName))) || FixedAttributePreSink(attributeName);
							// TODO: hard-match attributeName with a corresponding SINK_TAG...
							handler = PreSink(attributeName, sink, expression, attributeName);
						}

						// addRef(ref, <RMLTemplateExpressions.GenericHandler>{ handler: expression, type: attributeType, attribute: attributeName });
						addRef(ref, handler);
						// TODO: remove boolean attributes if they are bound to streams: disabled="${stream}"
						// should not be disabled by its mere presence, but depending on the value emitted by the stream.

						// isBooleanAttribute && console.log('>>>>>>>', initialValue, expression);

						const prefix = isBooleanAttribute && (!initialValue || !expression)
							? accPlusString.replace(new RegExp(`${attributeName}=['"]+$`), `_${attributeName}="`) // TODO: or maybe clean it up completely?
							: accPlusString
						;

						// acc += (<ClassRecord[]>[]).concat(<ClassRecord>expression)
						// 	.flatMap(cls =>
						// 		typeof cls == 'string'
						// 			? cls
						// 			: Object.entries(cls ?? {})
						// 				.filter(([, v]) => typeof v != 'string')
						// 				.map(([k]) => k)
						// 	)
						// 	.join(' ')
						// ;

						acc = (prefix +(initialValue ?? '')).replace(/<(\w[\w-]*)\s+([^>]+)$/, `<$1 ${existingRef?'':`${RESOLVE_ATTRIBUTE}="${ref}" `}$2`);
					}
				//} else if(/<\S+(?:\s+[a-z0-9_][a-z0-9_-]*(?:=(?:'[^']*'|"[^"]*"|\S+|[^>]+))?)*(?:\s+\.\.\.)?$/.test(accPlusString.substring(lastTag)) && /^(?:[^<]*>|\s+\.\.\.)/.test(nextString)) {
				} else if(/[a-z0-9_][a-z0-9_-][^>]+(?:\s+\.\.\.)?$/ig.test(accPlusString.substring(lastTag)) && /^(?:[^<]*>|\s+\.\.\.)/.test(nextString)) {
                    // FIXME:                                                                                                                                  ^    ^^^^^^^^^  why are we doing this?
					// Mixin Sink
					// Use Cases:
					// <some-tag some-attribute="some-value" ${mixin}></some-tag>
					// <some-tag some-attribute="some-value" ...${mixin}></some-tag>
					// <some-tag some-attributes ...${mixin} other-stuff>...</some-tag>
					// will bind multiple attributes and values
					let sink: SinkBindingConfiguration<HTMLElement | SVGElement | MathMLElement>;
					if(isSinkBindingConfiguration(expression)) {
						acc = accPlusString;
						sink = expression;
					} else {
						const attrs = <AttributeObject>expression;

						acc += string.replace(/\.\.\.$/, '');
						// Map static (string, number) properties of the mixin to attributes
						acc += Object.entries(attrs || {})
							.filter(([, v]) => typeof v == 'string' || typeof v == 'number')
							.map(([k, v])=>`${k}="${v}"`)
							.join(' ')
						;

						sink = Mixin(attrs);
					}

					// TODO: should we care about cleaning up the sink object from static attributes?
					addRef(ref, sink);
					acc = acc.replace(/<(\w[\w-]*)\s+([^<]*)$/, `<$1 ${existingRef?'':`${RESOLVE_ATTRIBUTE}="${ref}" `}$2`);

				} else if(/>\s*$/.test(string) && /^\s*</.test(nextString)) {
					// Content Sink
					// Use Cases:
					// <some-tag>${observable}</some-tag>
					// <some-tag>${BehaviorSubject}</some-tag> // will synchronously set the initial value of the BehaviorSubject, then update the element on subsequent emissions (good for SSR and to reduce repaints)

					const sinkExpression = <RMLTemplateExpressions.SinkExpression | RMLTemplateExpressions.HTMLText | RMLTemplateExpressions.TextString>expression;

					// If we have an initialValue, we treat it as a BehaviorSubject,
					// take its current .value, render is synchronously to avoid reflows
					// and then subscribe to subsequent emissions
					// FIXME: any chance an expression could be mistaken for a BehaviorSubject here? A Generator, or other stuff??? May want to have a better isBehaviorSubject check here...
					// const _source = <MaybeFuture<HTMLString>>(initialValue
					// 	? (expression?.source ?? expression)?.pipe?.( skip(1) )
					// 	: sinkExpression
					// );
					const _source = <MaybeFuture<HTMLString>>sinkExpression;

					// addRef(ref, <RMLTemplateExpressions.GenericHandler>{ handler, type: sinkType, error: errorHandler, ...sinkType == 'collection' && {attribute: expression} || {} /*, termination: terminationHandler */ });
					addRef(ref, isSinkBindingConfiguration(_source) ? _source : InnerHTML(_source));
					acc = acc
						+(existingRef ? string : string.replace(/\s*>\s*$/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`))
						+(initialValue || '')
					;

				} else if(/>?\s*[^<]*$/m.test(string) && /^\s*[^<]*\s*<?/m.test(nextString)) {

					// TODO
					// will set the textContent of the given textNode
					addRef(ref, TextContent(expression));
					// FIXME: tbd
					// FIXME: are we adding #REF multiple times?
					//acc = existingRef?accPlusString:acc +string.replace(/\s*>/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`) +ref;
					acc += (existingRef?string:string.replace(/\s*>(?=[^<]*$)/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`)) +INTERACTIVE_NODE_START +(initialValue ?? '') +INTERACTIVE_NODE_END;

				} else {

					acc = accPlusString;
					// ???

				}

			}
		}
	}
	acc += strings[strlen];

	return <HTMLString>acc;
}
