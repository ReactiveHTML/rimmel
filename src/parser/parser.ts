import type { AttributeObject, BindingConfiguration, RMLTemplateExpression, RMLTemplateExpressions, SourceBindingConfiguration } from "../types/internal";
import type { HTMLString, RMLEventAttributeName, RMLEventName } from "../types/dom";

import { isSinkBindingConfiguration } from "../types/internal";

import { waitingElementHanlders } from "../internal-state";
import { isFunction } from "../utils/is-function";
import { BehaviorSubject, isObservable, MaybeFuture, Observable } from "../types/futures";
import { BOOLEAN_ATTRIBUTES } from "../definitions/boolean-attributes";
import { NON_BUBBLING_DOM_EVENTS } from "../definitions/non-bubbling-events";
import { INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, REF_TAG, RESOLVE_ATTRIBUTE, RML_DEBUG } from "../constants";
import { delegateEvent } from "../lifecycle/event-delegation";

import { PreSink, sinkByAttributeName } from "../sinks/index";
import { DOMAttributePreSink, FixedAttributePreSink } from "../sinks/attribute-sink";
import { Mixin } from "../sinks/mixin-sink";
import { ObjectSource, isObjectSource } from "../sources/pojo-source";
import { ObserverSource, isObserverSource } from "../sources/observer-source";

import { isPromise } from '../types/futures';

import { skip } from 'rxjs';
import { InnerHTML, TextContent } from "../sinks/content-sink";
import { ClassRecord } from "../sinks/class-sink";

// FIXME: add a unique prefix to prevent collisions with different dupes of the library running in the same context/app
let refCount = 0;

const addRef = (ref: string, data: BindingConfiguration) => {
	waitingElementHanlders.get(ref)?.push(data) ?? waitingElementHanlders.set(ref, [data]);
};

const getEventName = (eventAttributeString: RMLEventAttributeName): RMLEventName | undefined => {
	const x = /\s+(rml:)?on(?<event>\w+)=['"]?$/.exec(eventAttributeString)?.groups;
	return x ? <RMLEventName>`${x.prefix??''}${x?.event}` : undefined
}
// GOTCHA: attributes starting with "on" will be treated as event handlers ------------------------------------> HERE <------------------, so avoid any <tag with ongoing="trouble">

export default function rml(strings: TemplateStringsArray, ...expressions: RMLTemplateExpression[]): HTMLString {
	let acc = '';
	const strlen = strings.length -1;
	for(let i=0; i<strlen; i++) {
		const string = strings[i];
		const accPlusString = acc +string;
		const lastTag = accPlusString.lastIndexOf('<');
		const expression = expressions[i];
		const initialValue = (expression as BehaviorSubject<unknown>)?.value; // if it's a BehaviorSubject, pick its initial/current value to render it synchronously
		const eventName = getEventName(string as RMLEventAttributeName);
		// const r = (resultPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*(?:\s*>\s*)?$/);
		// include the above, plus <!--SINK markers--> Needed for custom content sinks
		// TODO: remove <!-- SINK --> patterns, if any left...
//		const r = (accPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*>\s*(?:<!--[^>]+>\s*|[^<]*)*$/);
//		const r = (accPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*>\s*(?:[^<]*|<!--[^>]*>\s*)*$/);
//		const r = (accPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*>\s*(?:[^<]*?(?:<!--[^>]*>\s*)*)*$/);
		const r = (accPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*(?:>\s*[^<]*|[^>]*)$/);
		const existingRef = r?.groups?.existingRef;
		const ref = existingRef ?? `${REF_TAG}${refCount++}`;

		// Determine in which template context is any given expression appearing
		//const context =
		//	/>\s*$/.test(string) && /^\s*<\s*/.test(nextString) ? 'child/subtree'
		//	: /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString) ? 'attribute'

		if(string.includes(RML_DEBUG)) {
			const nl = (str: string) => str.replace(/\t/g, '  ');
			const currentTemplate = strings.reduce((str, next, j) => str.concat((j>0?'}':'') +nl(j==i ? next.replace(RML_DEBUG, `%c${RML_DEBUG}%c`) : next) +(j<=strlen-1?'${':''), j==i && next.includes(RML_DEBUG) ? ['color: red', ''] : [],(j<strlen ? expressions[j] : []) ), <string[]>[]);
			console.log(...currentTemplate);
			debugger; /* Stopped parsing a RML template */
		}

		if(expression == undefined || expression === '') {
			// remove nullish values except 0, "0", false and "false"
			// acc = accPlusString +(expression==0 || expression==false ? expression : '');
			acc = accPlusString;
		} else if(expression.lazy) {
			acc = accPlusString +expression.toString();
		} else if(eventName) {
			// Event Source
			// so feed it to an Rx Subject | Observer | Handler Function | POJO | Array

			// TODO: support EventListenerObject
			// Use Cases:
			// <a onclick="${subject}">
			// <a onclick="${()=>doSomething}">
			// <input type="text" onchange="${[object, 'attributeToSet']}">   will feed it the .value of the input field
			// <input type="text" onchange="${[array,  pos]}">    will feed it the .value of the input field

			const isNonBubblingEvent = NON_BUBBLING_DOM_EVENTS.has(eventName);

			const listener = isFunction(expression) ? expression
				: isObserverSource(expression) ? ObserverSource(expression)
				: isObjectSource(expression) ? ObjectSource(expression)
				: null // We allow it to be empty. If so, ignore, and don't connect any source. Perhaps add a warning in debug mode?
			;

			if(listener) {
				// We only use event delegation for bubbling events. Non-bubbling events will have their own listener attached directly.
				// TODO: shall we support direct, non-delegated event handling, as well (for a little extra performance boost, what else?)
				isNonBubblingEvent || delegateEvent(eventName);
				addRef(ref, <SourceBindingConfiguration<typeof eventName>>{ type: 'source', listener, eventName });
			} // TODO: shall we add some notifications, otherwise, rather than silently ignore?

			acc = accPlusString
				//+(eventName == 'mount' || isNonBubblingEvent ? ref : '')
				+(!listener || existingRef ? '' : `${ref}" ${RESOLVE_ATTRIBUTE}="${ref}`);
			// TODO: support {once: true}, {capture: true} and { passive: true }?
		} else {
			// Data Sink.
			// Determine its type before connecting.

			// 	// Custom/user-defined sink
			// 	?????
			// 	addRef(ref, <RMLTemplateExpressions.GenericHandler>{ type: 'sink', sink: expression.sink });
			// 	// addRef(ref, expression);
			// 	acc = accPlusString.replace(/<(\w[\w-]*)\s*([^>]*)(>?)\s*$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2$3`);

			// // } else if(typeof ((<Observable<unknown>>expression).subscribe ?? (<Promise<unknown>>expression).then)  == 'function' && i<strings.length -1 || typeof expression == 'object') {
			// } else if(
			if(['string', 'number'].includes(typeof expression)) {

				// Static expressions, no data binding. Just concatenate
				acc = accPlusString +expression;
			} else {
				// what if  !expression?

				// expression is a future or an object

				const nextString = strings[i+1];

				const isAttribute = /(?<attribute>[:a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(accPlusString);
				if(isAttribute) {

					const quotationMarks = isAttribute.groups!.quote;
					if(new RegExp(`^(?:[^>${quotationMarks}]*)${quotationMarks}?`).test(nextString)) {

						// Attribute Sink
						// Use Cases:
						// <some-tag some-attributes another-attribute="${observable}" other-stuff></some-tag>
						// <some-tag some-attributes class="some classes ${observable} and more" other-stuff></some-tag>
						// <some-tag some-attributes data-xxx="123" data-yyy="${observable}" other-stuff></some-tag>

						const attributeName = isAttribute.groups!.attribute;
						const isBooleanAttribute = BOOLEAN_ATTRIBUTES.has(attributeName);
						const sink = (sinkByAttributeName.get(attributeName) ?? (isBooleanAttribute && DOMAttributePreSink(attributeName))) || FixedAttributePreSink(attributeName);
						const handler = PreSink(sink, expression, attributeName);

						// addRef(ref, <RMLTemplateExpressions.GenericHandler>{ handler: expression, type: attributeType, attribute: attributeName });
						addRef(ref, handler);
						// TODO: remove boolean attributes if they are bound to streams: disabled="${stream}"
						// should not be disabled by its mere presence, but depending on the value emitted by the stream.

						const prefix = isBooleanAttribute && !initialValue
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
				} else if(/<\S+(?:\s+[^=>]+(?:=(?:'[^']*'|"[^"]*"|\S+|[^>]+))?)*(?:\s+\.\.\.)?$/.test(accPlusString.substring(lastTag)) && /^(?:[^<]*>|\s+\.\.\.)/.test(nextString)) {
                                       // FIXME:                                                                                                  ^    ^^^^^^^^^  why are we doing this?
					// Mixin Sink
					// Use Cases:
					// <some-tag some-attribute="some-value" ${mixin}></some-tag>
					// <some-tag some-attribute="some-value" ...${mixin}></some-tag>
					// <some-tag some-attributes ...${mixin} other-stuff>...</some-tag>
					// will bind multiple attributes and values
					const attrs = <AttributeObject>expression;

					acc += string.replace(/\.\.\.$/, '');
					// Map static (string, number) properties of the mixin to attributes
					acc += Object.entries(attrs || {})
						.filter(([, v]) => typeof v == 'string' || typeof v == 'number')
						.map(([k, v])=>`${k}="${v}"`)
						.join(' ')
					;
					// TODO: should we care about cleaning up the sink object from static attributes?
					addRef(ref, Mixin(attrs));
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
					const _source = <MaybeFuture<HTMLString>>(initialValue
						? expression.pipe?.( skip(1) )
						: sinkExpression
					);

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
					// FIXME: are we adding the #REF multiple times?
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
