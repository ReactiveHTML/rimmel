import type { AttributeObject, BindingConfiguration, RMLTemplateExpression, RMLTemplateExpressions, SourceBindingConfiguration } from "../types/internal";
import type { HTMLString, RMLEventAttributeName, RMLEventName } from "../types/dom";

import { waitingElementHanlders } from "../internal-state";
import { isFunction } from "../utils/is-function";
import { BehaviorSubject, Observable } from "../types/futures";
import { BOOLEAN_ATTRIBUTES } from "../definitions/boolean-attributes";
import { NON_BUBBLING_DOM_EVENTS } from "../definitions/non-bubbling-events";
import { INTERACTIVE_NODE_START, INTERACTIVE_NODE_END, REF_TAG, RESOLVE_ATTRIBUTE, RML_DEBUG } from "../constants";
import { delegateEvent } from "../lifecycle/event-delegation";

import { PreSink, sinkByAttributeName } from "../sinks/index";
import { DOMAttributePreSink, FixedAttributePreSink } from "../sinks/attribute-sink";
import { errorHandler } from "../sinks/error-sink";
import { terminationHandler } from "../sinks/termination-sink";
import { Mixin } from "../sinks/mixin-sink";
import { POJOSource, isPOJOSource } from "../sources/pojo-source";
import { ObserverSource, isObserverSource } from "../sources/observer-source";
import { isSink } from "../types/sink";

import { isObserver, isPromise } from '../types/futures';

import { skip } from 'rxjs';
import { InnerHTML, TextContent } from "../sinks/content-sink";

// Deprecated
const sinkSpecifierPattern = /\s*<!--\s*SINK:\s*(\w+)\s*-->\s*$/;

// FIXME: add a unique prefix to prevent collisions with different dupes of the library running in the same context/app
let refCount = 0;

const addRef = <E extends Element, F extends E>(ref: string, data: BindingConfiguration) => {
	// const h = data?.handler;
	// if(isFunction(h)) {
	// 	data.handler = function Source(...args: any[]) { return h(...args)}
	// } else if(isObservable(h)) {
	// 	debugger;
	// 	// data.handler = h.pipe(
	// 	// 	tap(x=>console.log(x))
	// 	// )
	// }
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
			// Parsing
			debugger;
		}

		if(expression == undefined) {
			// remove nullish values except 0, "0", false and "false"
			// acc = accPlusString +(expression==0 || expression==false ? expression : '');
			acc = accPlusString;
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
				: isPOJOSource(expression) ? POJOSource(expression)
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
			if(
				((<Observable<any>>expression)?.subscribe || (<Promise<any>>expression)?.then) // && i<strings.length -1 (TODO: can we safely remove this part?)
				 || typeof expression == 'object'
				 || !expression) {

				// expression is a future or an object

				const nextString = strings[i+1];

				const isAttribute = /(?<attribute>[:a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(accPlusString);
				if(isAttribute) {

					const quotationMarks = isAttribute.groups!.quote;
					if(new RegExp(`^(?:[^>${quotationMarks}]*)${quotationMarks}`).test(nextString)) {

						// Attribute Sink
						// Use Cases:
						// <some-tag some-attributes another-attribute="${observable}" other-stuff></some-tag>
						// <some-tag some-attributes class="some classes ${observable} and more" other-stuff></some-tag>
						// <some-tag some-attributes data-xxx="123" data-yyy="${observable}" other-stuff></some-tag>

						const attributeName = isAttribute.groups!.attribute;
						const isBooleanAttribute = BOOLEAN_ATTRIBUTES.has(attributeName);
						const sink = sinkByAttributeName.get(attributeName) ?? (isBooleanAttribute && DOMAttributePreSink(attributeName)) ?? FixedAttributePreSink(attributeName);
						const handler = PreSink(sink, expression, attributeName);

						// addRef(ref, <RMLTemplateExpressions.GenericHandler>{ handler: expression, type: attributeType, attribute: attributeName });
						addRef(ref, handler);
						// TODO: remove boolean attributes if they are bound to streams: disabled="${stream}"
						// should not be disabled by its mere presence, but depending on the value emitted by the stream.

						const prefix = isBooleanAttribute && !initialValue
							? accPlusString.replace(new RegExp(`${attributeName}=['"]+$`), `_${attributeName}="`) // TODO: or maybe clean it up completely?
							: accPlusString
						;
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


					// If we have an initialValue, we treat it as a BehaviorSubject,
					// take its current .value, render is synchronously to avoid reflows
					// and then subscribe to subsequent emissions
					const _source  = initialValue
						? (<BehaviorSubject<HTMLString>>expression).pipe?.( skip(1) )
						: expression;

					// addRef(ref, <RMLTemplateExpressions.GenericHandler>{ handler, type: sinkType, error: errorHandler, ...sinkType == 'collection' && {attribute: expression} || {} /*, termination: terminationHandler */ });
					addRef(ref, isSink(expression) ? _source : InnerHTML(_source));
					acc = acc
						+(existingRef ? string : string.replace(/\s*>\s*$/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`))
						+(initialValue || '');

				} else if(/>?\s*[^<]+$/m.test(string) && /^\s*[^<]*\s*<?/m.test(nextString)) {

					// TODO
					// will set the textContent of the given textNode
					addRef(ref, TextContent(expression));
					// FIXME: tbd
					// FIXME: are we adding the #REF multiple times?
					//acc = existingRef?accPlusString:acc +string.replace(/\s*>/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`) +ref;
					acc += string.replace(/\s*>/, ` ${RESOLVE_ATTRIBUTE}="${ref}">`) +INTERACTIVE_NODE_START +(initialValue ?? '') +INTERACTIVE_NODE_END;

				} else {

					acc = accPlusString;
					// ???

				}

			} else if(/\.\.\.$/.test(string)) {

				// TODO: we want to make "..." optional
				// Mixins
				// Use Cases:
				// <some-tag ...${DocumentObject}>
				// <some-tag ...${Promise<DocumentObject>}>
				// <some-tag ...${Observable<DocumentObject>}>
				// N.B: these will be merged post-mount.
				// TODO: enable merging objects directly into the template string, too
				console.debug('Mixin Sink', string, expression);
				acc += string
					.substr(0, string.length -3)
					.replace(/\.\.\.$/, '');
				if(isObserver(expression) || isPromise(expression)) {
					// Promise or observable that will emit attributes later
					addRef(ref, <RMLTemplateExpressions.GenericHandler>{ handler: expression, type: 'attributeobject', attribute: expression });
				} else if(typeof expression == 'string') {
					acc += expression;
				} else {
					// FIXME: spread properties and requeue them for re-processing, as if these came from the template
					acc += Object.entries(expression || {}).map(([k, v])=>`${k}="${v}"`).join(' ');
				}

			} else {

				// Static expressions, no data binding. Just concatenate
				acc = accPlusString +expression;

			}
		}
	}
	acc += strings[strlen];

	return <HTMLString>acc;
}
