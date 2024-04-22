import { Handler, InlineAttributeHandler, TemplateExpression } from "../types/internal";
import { HTMLContainerElement, HTMLString, RMLEventAttributeName, RMLEventName } from "../types/dom";
import { waitingElementHanlders } from "../internal-state";
import { isFunction } from "../utils/is-function";
import { BehaviorSubject, Observable, Subject } from "../types/futures";
import { nonBubblingAttributes } from "../lifecycle/lifecycle-handler";
import { delegateEvent } from "../lifecycle/event-delegation";
import { errorHandler } from "../sinks/error-sink";
import { terminationHandler } from "../sinks/termination-sink";
import { POJOSource, isPOJOSource } from "../sources/pojo-source";
import { ObserverSource, isObserverSource } from "../sources/observer-source";
import { Sink, isSink } from "../types/sink";

import { skip } from 'rxjs';

// Probably deprecating this and moving to have sinks out of the map
const sinkSpecifierPattern = /\s*<!--\s*SINK:\s*(\w+)\s*-->\s*$/;

let refCount = 0;

const addRef = (ref: string, data: Handler<Element>) => {
	const t = (waitingElementHanlders.get(ref) || []).concat(data);
	waitingElementHanlders.set(ref, t);
};

const getEventName = (eventAttributeString: RMLEventAttributeName): RMLEventName | undefined => <RMLEventName>/\s+on(?<event>\w+)=['"]?$/.exec(eventAttributeString)?.groups?.event;
// GOTCHA: attributes starting with "on" will be treated as event handlers ------------------------------------> HERE <------------------, so avoid any <tag with ongoing="trouble">

export default function rml(strings: TemplateStringsArray, ...expressions: TemplateExpression[]): HTMLString {
	let result = '';
	for(let i=0;i<strings.length;i++) {
		const string = strings[i];
		const resultPlusString = result +string;
		const lastTag = resultPlusString.lastIndexOf('<');
		const expression: TemplateExpression = expressions[i];
		const initialValue = (expression as BehaviorSubject<unknown>)?.value; // if it's a BehaviorSubject, pick its initial/current value to render it synchronously
		const eventName = getEventName(string as RMLEventAttributeName);
		// const r = (resultPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*(?:\s*>\s*)?$/);
		// include the above, plus <!--SINK markers--> Needed for custom content sinks
		const r = (resultPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*(?:\s*>\s*)?(?:<!--[^>]+>\s*)*$/);
		const existingRef = r && r.groups?r.groups.existingRef:undefined;
		const ref = existingRef || `#REF${refCount++}`;

		//const context =
		//		/>\s*$/.test(string) && /^\s*<\s*/.test(nextString) ? 'child'
		//		: /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString) ? 'attribute'

		if(eventName) {
			// It's an Event Source, so feed it to an Rx Subject | Observer | Handler Function | POJO | Array
			// TODO: support EventListenerObject
			// Use Cases:
			// <a onclick="${subject}">
			// <a onclick="${()=>doSomething}">
			// <input type="text" onchange="${[object, 'attributeToSet']}">   will feed it the .value of the input field
			// <input type="text" onchange="${[array,  pos]}">    will feed it the .value of the input field
			const isNonBubblingEvent = nonBubblingAttributes.has(eventName);
			const h = isFunction(expression) ? expression
				: isObserverSource(expression) ? ObserverSource(expression)
				: isPOJOSource(expression) ? POJOSource(expression)
				: null; // We allow it to be empty. If so, ignore, and don't connect any source. Perhaps add a warning in debug mode?
			if(h) {
				// Only use event delegation for bubbling events
				isNonBubblingEvent || delegateEvent(eventName);
				addRef(ref, { handler: h, type: 'event', eventName });
			}
			result = resultPlusString
				+(eventName == 'mount' || isNonBubblingEvent ? ref : '')
				+(!h || existingRef ? '' : `${ref}" RESOLVE="${ref}`);
			// TODO: support {once: true}, {capture: true} and { passive: true }?
		} else {
			// It's a Data Sink. Determine its type before connecting.
			if(isSink(expression)) {
				// Custom/user-defined sink, registered in DOMSinks
				addRef(ref, <Handler<HTMLElement>>{ handler: expression, type: expression.sink });
					// FIXME: wrong regexp, will only work for a whole tag
				result = result + string.replace(/<(\w[\w-]*)\s*([^>]*)/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
			} else if(typeof ((<Observable<unknown>>expression).subscribe ?? (<Promise<unknown>>expression).then)  == 'function' && i<strings.length -1 || typeof expression == 'object') {
				// handler is a promise or an observable. subscribe to it and set up a sink
				const nextString = strings[i+1];
				const isAttribute = /(?<attribute>[:a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString);
				if(isAttribute && new RegExp(`^(?:[^>${isAttribute.groups?.quote}]*)${isAttribute.groups?.quote}`).test(nextString)) {
					// Attribute Sink
					// Use Cases:
					// <some-tag some-attributes another-attribute="${observable}" other-stuff></some-tag>
					// <some-tag some-attributes class="some classes ${observable} and more" other-stuff></some-tag>
					// <some-tag some-attributes data-xxx="123" data-yyy="${observable}" other-stuff></some-tag>
					let attributeName = isAttribute.groups?.attribute ?? '';
					const attributeType =
						attributeName == 'rml:remove'
							? 'removal' :
						attributeName == 'class' || attributeName == 'style' || attributeName == 'value'
							? attributeName
							: !attributeName.indexOf('data')
								? 'dataset'
								: 'attribute'
					;
					if(attributeType == 'dataset') {
						attributeName = attributeName.replace(/^data-/, '');
					}
					const initialValue = '';
					addRef(ref, <Handler>{ handler: expression, type: attributeType, attribute: attributeName });
					result = (resultPlusString +initialValue).replace(/<(\w[\w-]*)\s+([^>]+)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
					//result = result.replace(/([a-z0-9_\-]+=(?<q>['"]?)(?:.*(?!\k<q>)))$/i, `RESOLVE="${ref}" $1`)
				//} else if(/<\s*\S+(?:\s+[^=>]+=(?<q>['"]?)[^\k<q>]*\k<q>)*(?:\s+\.\.\.)?$/.test(resultPlusString) && /^[^<]*>/.test(nextString)) {
				} else if(/<\s*\S+(?:\s+[^=>]+(?:=(?:'[^']*'|"[^"]*"|\S+|[^>]+)))*(?:\s+\.\.\.)?$/.test(resultPlusString.substring(lastTag)) && /^(?:[^<]*>|\s+\.\.\.)/.test(nextString)) {
					// Mixin Sink
					// Use Cases:
					// <some-tag some-attribute="some-value" ${observable}</some-tag>
					// <some-tag some-attribute="some-value" ...${observable}</some-tag>
					// <some-tag some-attributes ...${observable<dataset>} other-stuff>...</some-tag>
					// will bind multiple attributes and values
					result += string.replace(/\.\.\.$/, '');
					// Map static (string, number) properties of the mixin to attributes
					result += Object.entries(expression || {})
						.filter(([, v]) => typeof v == 'string' || typeof v == 'number')
						.map(([k, v])=>`${k}="${v}"`)
						.join(' ')
					;
					// TODO: should we care about cleaning up the sink object from static attributes?
					addRef(ref, <InlineAttributeHandler>{ handler: expression, type: 'attributeobject', attribute: expression });
					result = result.replace(/<\s*(\w[\w-]*)\s+([^<]*)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
				} else if(/>\s*$/.test(string) && /^\s*<\s*/.test(nextString)) {
					// InnerHTMLSink
					// Use Cases:
					// <some-tag>${observable}</some-tag>
					// <some-tag>${BehaviorSubject}</some-tag> // will synchronously set the initial value of the BehaviorSubject, then update the element on subsequent emissions (good for SSR and to reduce repaints)
					let sinkType: string; // TODO: maybe stop using a string that needs looking up in DOMSinks?
					let string2: string;
					string2 = string.replace(sinkSpecifierPattern, '');
					sinkType = RegExp.$1 || (<Sink<Element>>expression).sink || 'innerHTML';
					// If we have an initialValue, it's a BehaviorSubject.
					// Take its current value, render is synchronously to avoid reflows
					// and subscribe to subsequent emissions
					const handler = initialValue ? (<BehaviorSubject<HTMLString>>expression).pipe?.(skip(1)) : expression;
					addRef(ref, <Handler<HTMLContainerElement>>{ handler, type: sinkType, error: errorHandler, ...sinkType == 'collection' && {attribute: expression} || {}, termination: terminationHandler });
					result = result
						+(existingRef?string2:string2.replace(/\s*>\s*$/, ` RESOLVE="${ref}">`))
						+(initialValue || '');
				} else if(/>\s*[^<]+$/m.test(string) && /^\s*[^<]*\s*</m.test(nextString)) {
					// textContentSink
					// TODO
					// will set the textContent of the given textNode
					addRef(ref, <Handler>{ handler: expression, type: 'textContent' });
					// FIXME: tbd
					result = existingRef?resultPlusString:result +string.replace(/\s*>/, ` RESOLVE="${ref}">`) +ref;
				} else {
					result = resultPlusString;
					// ???
				}
			} else if(/\.\.\.$/.test(string)) {
				// Mixins
				// Use Cases:
				// <some-tag ...${RDOMObject}>
				// <some-tag ...${Promise<RDOMObject>}>
				// <some-tag ...${Observable<RDOMObject>}>
				// N.B: these will be merged post-mount.
				// TODO: enable merging objects directly into the template string, too
				result += string
					.substr(0, string.length -3)
					.replace(/\.\.\.$/, '');
				if(isFunction((expression as Subject<unknown>).next) || isFunction((expression as Promise<unknown>).then)) {
					// Promise or observable that will emit attributes later
					addRef(ref, <Handler>{ handler: expression, type: 'attributeobject', attribute: expression });
				} else if(typeof expression == 'string') {
					result += expression;
				} else {
					// FIXME: spread properties and requeue them for re-processing, as if these came from the template
					result += Object.entries(expression || {}).map(([k, v])=>`${k}="${v}"`).join(' ');
				}
			} else if(Array.isArray(expression)) {
				// FIXME: is this reachable at all?
				// Use Cases:
				// <some-tag ${[string, string, string]}>
				// TODO: handle array elements not being just simple strings to join...
				console.log('RML inline array sink', expression);
				result = resultPlusString +expression.join('');
			} else if(typeof expression == 'object') {
				// FIXME: is this reachable at all?
				console.log('RML inline object sink', expression);
				const [strings, args] = Object.entries(expression)
					.reduce(([strings, args], [k, v]) => [strings.concat(k), args.concat(v)], [<string[]>[], []]);
				result += string +rml(<TemplateStringsArray><unknown>strings, ...args);
			} else {
				result = resultPlusString +expression;
			}
		}
	}
	return <HTMLString>result;
}
