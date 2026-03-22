import type { AttributeObject, BindingConfiguration, RMLTemplateExpression, RMLTemplateExpressions, SinkBindingConfiguration, SourceBindingConfiguration } from "../types/internal";
import type { Future, MaybeFuture } from "../types/futures";
import type { Sink } from "../types/sink";
import type { HTMLString, RMLEventAttributeName, RMLEventName } from "../types/dom";

import { isFutureSinkAttributeValue, isSinkBindingConfiguration, isSourceBindingConfiguration } from "../types/internal";

import { currentValue } from "../lib/current-value";
import { state, waitingElementHandlers } from "../internal-state";
import { BOOLEAN_ATTRIBUTES } from "../definitions/boolean-attributes";
import { INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, REF_TAG, RESOLVE_ATTRIBUTE, RML_DEBUG } from "../constants";

import { PreSink } from "../sinks/index";
import { sinkByAttributeName } from '../parser/sink-map';
import { DOMAttributePreSink, FixedAttributePreSink, WritableElementAttribute } from "../sinks/attribute-sink";
import { Mixin } from "../sinks/mixin-sink";

import { InnerHTML } from "../sinks/inner-html-sink";
import { TextContent } from "../sinks/text-content-sink";
import { StyleObjectSink, StylePreSink, STYLE_OBJECT_SINK_TAG } from "../sinks/style-sink";
import { isFuture } from "../types/futures"
import { isRMLEventListener } from "../types/event-listener";
import { DatasetItemPreSink } from "../sinks/dataset-sink";
import { ClassObjectSink } from "../sinks/class-sink";
import { chronolyze } from "../utils/chronolyze";
import { KVP } from "../types/key-value-pair";
import { ENABLE_RML_DEBUGGER } from "../debug";

/**
 * Store some data binding information to be used at mount time
 */
export const addRef = (ref: string, data: BindingConfiguration) => {
	waitingElementHandlers.get(ref)?.push(data) ?? waitingElementHandlers.set(ref, [data]);
};

const getEventName = (eventAttributeString: RMLEventAttributeName): [RMLEventName, RMLEventAttributeName] | [] => {
	const x = /\s+(?<attr>(?<prefix>rml:)?on(?<event>\w+))=['"]?$/.exec(eventAttributeString)?.groups;
	return x ? [<RMLEventName>`${x.prefix??''}${x?.event}`, <RMLEventAttributeName>x.attr] : []
};

/**
 * rml — the main entry point for Rimmel.js
 *
 * rml is a tag function. You call it by tagging it with an ES6 template literal
 * of HTML text interleaved with references to any JavaScript entity that's in scope.
 * 
 * Any JavaScript expression inside the template literal will be evaluated and the
 * resulting value will be inserted into the HTML template literal. Async expressions
 * such as Promises and Observables will be rendered as they resolve/emit.
 *
 * ## Example
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const content = 'hello world';
 *
 *   return rml`
 *     <div>${content}</div>
 *   `;
 * };
 * ```
 * 
 * ## Example
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const num = 123;
 *
 *   return rml`
 *     <input type="number" value="${number}">
 *   `;
 * };
 * ```
 * 
 * ## Example
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const data = fetch('/api').then(res => res.text());
 *
 *   return rml`
 *     <div>${data}</div>
 *   `;
 * };
 * ```
 **/
export function rml(_strings: TemplateStringsArray, ..._expressions: RMLTemplateExpression[]): HTMLString {
	const strings = [..._strings];
	const expressions = [..._expressions];

	let acc = '';
	let strlen = strings.length -1;

	for(let i=0; i<strlen; i++) {
		const string = strings[i];
		const accPlusString = acc +string;
		const expression = expressions[i];

		// TODO: Determine in which template context is any given expression appearing
		// Then, depending on the context, call matching parser modules and (yet-to-be-created) registered parser plugins
		//const context =
		//	/>\s*$/.test(string) && /^\s*<\s*/.test(nextString) ? 'child/subtree'
		//	: /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString) ? 'attribute'

		// We treat and render any null or undefined values as empty strings
		// as a graceful handling of non-values (should this be configurable for a better QA?)
		// const printableExpressionType = typeof expression ?? 'undefined';
		const printableExpressionType = typeof (expression ?? '');

		if(ENABLE_RML_DEBUGGER) {
			if(string.includes(RML_DEBUG)) {
				const nl = (str: string) => str.replace(/\t/g, '  ');
				const reducer = (str: string[], next: string, j: number) => str.concat(
					(j>0?'}':'') +nl(j==i ? next.replace(RML_DEBUG, `%c${RML_DEBUG}%c`) : next),
					j==i && next.includes(RML_DEBUG)
						? ['color: red', '']
						: [],
					(j<=strlen-1?'${':'') +(j<strlen ? expressions[j] : [])
				);
				const template = strings.join('${...}');
				const currentTemplate = strings.reduce(reducer, <string[]>[]);
				console.log(...currentTemplate);

				/* Stopped parsing a RML template */

				// The current template being processed, without parameters
				template;

				debugger;
			}
		}

		if(['string', 'number', 'boolean'].includes(printableExpressionType)) {
			// Static expressions, no data binding. Just concatenate and move on
			acc = accPlusString +(expression ?? '');
		} else {

			const lastTag = accPlusString.lastIndexOf('<');
			const [ eventName, eventAttributeName ] = getEventName(string as RMLEventAttributeName);
			const r = (accPlusString).match(/<\w[\w-]*\s+[^>]*resolve="(?<existingRef>[^"]+)"\s*[^>]*(?:>\s*[^<]*|[^>]*)$/);
			const existingRef = r?.groups?.existingRef;
			const ref = existingRef ?? `${REF_TAG}${state.refCount++}`;

			if(eventName) {
				// Event Source
				// so feed it to an Rx Subject | Observer | Handler Function | POJO | Array

				// TODO: support EventListenerObject?
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
					listener = expression;
					if(listener) {
						addRef(ref, <SourceBindingConfiguration<typeof eventName>>{ type: 'source', listener, eventName });
					} // TODO: shall we add some notifications, otherwise, rather than silently ignore?
				}

				acc = accPlusString
					.replace(/\s((?:rml:)?on\w+=['"]?)$/, ' _$1')
					+(!listener || existingRef ? '' : `${ref}" ${RESOLVE_ATTRIBUTE}="${ref}`);
			} else {
				// Data Sink.

				if(Array.isArray(expression)) {
					// If sinking an array, we're likely just mapping it
					acc = accPlusString +expression.join('');
				} else {
					// expression is a future or an object

					const nextString = strings[i+1];
					// if it's a BehaviorSubject or any other sync stream (e.g.: startWith operator), pick its initial/current value to render it synchronously
					let initialValue = currentValue(expression.source ?? expression) ?? '';

					const isAttribute = /(?<attribute>[:a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(accPlusString);
					if(isAttribute) {

						const quotationMarks = isAttribute.groups!.quote;
						if(new RegExp(`^(?:[^>${quotationMarks}]*)${quotationMarks}?`).test(nextString)) {

							// Attribute Sink
							// Use Cases:
							// <some-tag some-attributes another-attribute="${observable}" other-stuff></some-tag>
							// <some-tag some-attributes class="some classes ${observable} and more" other-stuff></some-tag>
							// <some-tag some-attributes data-xxx="123" data-yyy="${observable}" other-stuff></some-tag>

							let sink: Sink<HTMLElement | SVGElement>;
							let isBooleanAttribute;
							let handler: SinkBindingConfiguration<HTMLElement | SVGElement>;
							const attributeName = isAttribute.groups!.attribute;
							if(attributeName == 'style') {
								const CSSAttribute = /;?(?<key>[a-z\-][a-z0-9\-_]*)\s*:\s*$/.exec(string)?.groups?.key;
								// Are we setting any specific CSS properties or the whole style attribute?
								// TODO: what if both?
								sink = CSSAttribute ? StylePreSink(CSSAttribute) : StyleObjectSink;
								handler = PreSink<HTMLElement | SVGElement>(STYLE_OBJECT_SINK_TAG, sink, expression, CSSAttribute);
								// TODO: should remove deferred CSS rules from the HTML to handle <x style="color: ;"> cases
							} else if(attributeName == 'class') {
								sink = ClassObjectSink;
								if(isFutureSinkAttributeValue(expression)) {
									// it's a Future<class>
									handler = PreSink(attributeName, sink, expression, attributeName);
								} else {
									// it's either a plain ClassObject or a Chronosympton<ClassObject>
									// Merge present properties of the object inline in the HTML and the rest in a future sink
									const splitter = ([k, v]: KVP) => isFutureSinkAttributeValue(v);
									const [statics, deferreds] = chronolyze(expression as AttributeObject || {}, splitter);

									if(deferreds.length) {
										handler = PreSink(attributeName, sink, deferreds.reduce((a, b) => ({...a, ...b}), {}), attributeName);
									}

									initialValue = statics.flatMap(s=>Object.entries(s)).filter(([k, v]) => v).map(([k, v]) => k).join(' ');
								}
							} else {
								isBooleanAttribute = BOOLEAN_ATTRIBUTES.has(attributeName);
								const isDatasetAttribute = attributeName.startsWith('data-');
								sink = (
									sinkByAttributeName.get(attributeName)
									?? (isBooleanAttribute && DOMAttributePreSink(<WritableElementAttribute>attributeName))
									?? (isDatasetAttribute && DatasetItemPreSink(attributeName))
								) || FixedAttributePreSink(attributeName);

								// TODO: hard-match attributeName with a corresponding SINK_TAG...
								handler = PreSink(attributeName, sink, expression, attributeName);
							}

							if(handler!) {
								addRef(ref, handler);
							}
							// TODO: remove boolean attributes if they are bound to streams: disabled="${stream}"
							// should not be disabled by its mere presence, but depending on the value emitted by the stream.

							const prefix = isBooleanAttribute && (!initialValue || !expression)
								// REF0000266279391633
								? accPlusString.replace(new RegExp(`${attributeName}=['"]+$`), `_${attributeName}="`) // TODO: or maybe clean it up completely?
								: accPlusString
							;
							const h = prefix +initialValue;
							acc = (handler!)
								? h.replace(/<(\w[\w-]*)\s+([^>]+)$/, `<$1 ${existingRef?'':`${RESOLVE_ATTRIBUTE}="${ref}" `}$2`)
								: h
							;
						}
					} else if(/<[a-z_][a-z0-9_-]*[^>]*(?:\s+\.\.\.)?$/ig.test(accPlusString.substring(lastTag))) {

						// Mixin Sink
						// Use Cases:
						// <some-tag some-attribute="some-value" ${mixin}></some-tag>
						// <some-tag some-attribute="some-value" ...${mixin}></some-tag>
						// <some-tag some-attributes ...${mixin} other-stuff>...</some-tag>
						// will bind multiple attributes and values
						let sink: SinkBindingConfiguration<HTMLElement | SVGElement | MathMLElement>;
						acc += string.replace(/\.\.\.$/, '');
						if(isSinkBindingConfiguration(expression)) {
							// acc = accPlusString;
							sink = expression;
						} else if(isFuture(expression)) {
							// If we have a Promise, we wait for it to resolve and then render the mixin}
							sink = Mixin(expression as Future<AttributeObject>);
						} else {
							// Merge static (string, number) properties of the mixin as inline attributes into the HTML template
							// then bind the rest after mounting
							const splitter = ([k, v]: KVP) => isFutureSinkAttributeValue(v) || (typeof v != 'string' && isRMLEventListener(k, v));
							const [staticAttributes, deferredAttributes] = chronolyze(expression as AttributeObject || {}, splitter);

							staticAttributes.map(sa => Object.entries(sa).forEach(([k, v], idx) => {
								let cake = [];
								switch(k) {
									case 'class':
										acc = acc
											.replace(/(<\w+.*)class="([^"]*)"([^>]*)$/, '')
											+`${RegExp.$1} class="${([] as string[]).concat(RegExp.$2, Object.entries(typeof v == 'string' ? {[v]: true} : v).filter(([k, v]) => v).map(([k, v])=>k)).filter(x=>x).join(' ')}" ${RegExp.$3}`
										break;
									case 'style':
										acc = acc
											.replace(/(<\w+.*)style="([^"]*);?\s*"([^>]*)$/, '')
											+`${RegExp.$1} style="${([] as string[]).concat(RegExp.$2, typeof v == 'string' ? v : Object.entries(v).filter(([k, v]) => v).map(([k, v])=>`${k}: ${v};`)).filter(x=>x).join(' ')}" ${RegExp.$3}`
										break;
									case 'innerText':
									case 'innerHTML':
									case 'prependHTML':
										// case 'appendHTML':
										const [a, b] = nextString.split('>');
										strings[i]+='>';
										strings.splice(i+1, 1, a, b);
										expressions.splice(i+1, 0, '>'+v);
										// i--;
										strlen++;
										break;
									default:
										cake.push(`${k}="${v}"`);
								}
								acc += ' ' +cake.join(' ');
								cake = [];
							}));
							const s = deferredAttributes.reduce((a, b) => ({...a, ...b}), {})
							sink = Mixin(s);
						}

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
							+initialValue
						;

					} else if(/>?\s*[^<]*$/m.test(string) && /^\s*[^<]*\s*<?/m.test(nextString)) {

						// will set the textContent of the given textNode
						addRef(ref, TextContent(expression, true));
						// FIXME: are we adding #REF multiple times?
						//acc = existingRef?accPlusString:acc +string.replace(/\s*>/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`) +ref;
						acc += (existingRef?string:string.replace(/\s*>(?=[^<]*$)/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`)) +INTERACTIVE_NODE_START +initialValue +INTERACTIVE_NODE_END;

					} else {
						acc = accPlusString;
					}
				}

			}
		}
	}
	acc += strings[strlen];

	return <HTMLString>acc;
}
