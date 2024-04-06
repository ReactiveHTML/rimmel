import { Handler, InlineAttributeHandler, MaybeHandler } from "../types/internal";
import { HTMLString, RMLEventAttributeName, RMLEventName } from "../types/dom";
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

// FIXME: can this be removed by linters?
const sinkSpecifierPattern = /\s*<!--\s*SINK:\s*(\w+)\s*-->\s*$/;

let refCount = 0;

const addRef = (ref: string, data: Handler) => {
	const t = (waitingElementHanlders.get(ref) || []).concat(data);
	waitingElementHanlders.set(ref, t);
};

const getEventName = (eventAttributeString: RMLEventAttributeName): RMLEventName | undefined => <RMLEventName>/\s+on(?<event>\w+)=['"]?$/.exec(eventAttributeString)?.groups?.event;
// GOTCHA: attributes starting with "on" will be treated as event handlers ------------------------------------> HERE <-----------------------, so avoid any <tag ongoing="trouble">

export default function rml(strings: TemplateStringsArray, ...args: MaybeHandler[]): HTMLString {
	let result = '';
	for(let i=0;i<strings.length;i++) {
		const string = strings[i];
		const resultPlusString = result +string;
		const lastTag = resultPlusString.lastIndexOf('<');
		const maybeHandler: MaybeHandler = args[i];
		const initialValue = (maybeHandler as BehaviorSubject<unknown>)?.value; // if it's a BehaviorSubject, pick its initial/current value to render it synchronously
		const eventName = getEventName(string as RMLEventAttributeName);
		// const r = (resultPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*(?:\s*>\s*)?$/);
		// include the above, plus <!--SINK markers--> Needed for custom content sinks
		const r = (resultPlusString).match(/<\w[\w-]*\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*(?:\s*>\s*)?(?:<!--[^>]+>\s*)*$/);
		const existingRef = r && r.groups?r.groups.existingRef:undefined;
		const ref = existingRef || `#REF${refCount++}`;

		//const context =
		//		/>\s*$/.test(string) && /^\s*<\s*/.test(nextString) ? 'child'
		//		: /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString) ? 'attribute'

		if(maybeHandler) {
			if(eventName) {
				// It's an Event Source, so feed it to an Rx Subject | Observer | Handler Function | POJO | Array
				// TODO: support EventListenerObject
				// Use Cases:
				// <a onclick="${subject}">
				// <a onclick="${()=>doSomething}">
				// <input type="text" onchange="${[object, 'attributeToSet']}">   will feed it the .value of the input field
				// <input type="text" onchange="${[array,  pos]}">    will feed it the .value of the input field
				const isNonBubblingEvent = nonBubblingAttributes.has(eventName);
				const h = isFunction(maybeHandler) ? maybeHandler
					: isObserverSource(maybeHandler) ? ObserverSource(maybeHandler)
					: isPOJOSource(maybeHandler) ? POJOSource(maybeHandler)
					: null; // We allow it to be empty. If so, ignore, and don't connect any source. Perhaps add a warning in debug mode?
				if(h) {
					// Only use event delegation for bubbling events
					isNonBubblingEvent || delegateEvent(eventName);
					addRef(ref, { handler: h, type: 'event', eventName });
				}
				result = resultPlusString
					+(eventName == 'mount' || isNonBubblingEvent ? ref : '')
					+(!h || existingRef ? '' : `${ref}" RESOLVE="${ref}`);
				// TODO: support {once: true} and {capture: true} and { passive: true }?
			} else {
				// It's a Data Sink. Determine which type before connecting.
				if(isSink(maybeHandler)) {
					// Custom/user-defined sink, registered in DOMSinks
					addRef(ref, <Handler>{ handler: maybeHandler, type: maybeHandler.sink });
						// FIXME: wrong regexp, will only work for a whole tag
					result = result + string.replace(/<(\w[\w-]*)\s*([^>]*)/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
				} else if(typeof ((<Observable<unknown>>maybeHandler).subscribe ?? (<Promise<unknown>>maybeHandler).then)  == 'function' && i<strings.length -1 || typeof maybeHandler == 'object') {
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
						addRef(ref, <Handler>{ handler: maybeHandler, type: attributeType, attribute: attributeName });
						result = (resultPlusString +initialValue).replace(/<(\w[\w-]*)\s+([^>]+)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
						//result = result.replace(/([a-z0-9_\-]+=(?<q>['"]?)(?:.*(?!\k<q>)))$/i, `RESOLVE="${ref}" $1`)
					//} else if(/<\s*\S+(?:\s+[^=>]+=(?<q>['"]?)[^\k<q>]*\k<q>)*(?:\s+\.\.\.)?$/.test(resultPlusString) && /^[^<]*>/.test(nextString)) {
					} else if(/<\s*\S+(?:\s+[^=>]+(?:=(?:'[^']*'|"[^"]*"|\S+|[^>]+)))*(?:\s+\.\.\.)?$/.test(resultPlusString.substring(lastTag)) && /^(?:[^<]*>|\s+\.\.\.)/.test(nextString)) {
						// Use Cases:
						// <some-tag some-attribute="some-value" ${observable}</some-tag>
						// <some-tag some-attribute="some-value" ...${observable}</some-tag>
						// <some-tag some-attributes ...${observable<dataset>} other-stuff>...</some-tag>
						// will bind multiple attributes and values
						result += string.replace(/\.\.\.$/, '');

						if(true) {
							addRef(ref, <InlineAttributeHandler>{ handler: maybeHandler, type: 'attributeset', attribute: maybeHandler });
						} else {
							result += Object.entries(maybeHandler || {}).map(([k, v])=>`${k}="${v}"`).join(' ');
							//addRef(ref, { handler, type: 'attributeset' })
						}

						result = result.replace(/<\s*(\w[\w-]*)\s+([^<]*)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
					} else if(/>\s*$/.test(string) && /^\s*<\s*/.test(nextString)) {
						// InnerHTMLSink
						// Use Cases:
						// <some-tag>${observable}</some-tag>
						// <some-tag>${BehaviorSubject}</some-tag> // will synchronously set the initial value of the BehaviorSubject, then update the element on subsequent emissions (good for SSR and to reduce repaints)
						let sinkType: string; // TODO: maybe stop using a string that needs looking up in DOMSinks?
						let string2: string;

						string2 = string.replace(sinkSpecifierPattern, '');
						sinkType = RegExp.$1 || (<Sink<Element>>maybeHandler).sink || 'innerHTML';
						// FIXME: .skip(1) is RxJS<=5 specific. No dependencies here, pls
						addRef(ref, <Handler>{ handler: initialValue && maybeHandler.skip ? maybeHandler.skip(1) : maybeHandler, type: sinkType, error: errorHandler, ...sinkType == 'collection' && {attribute: maybeHandler} || {}, termination: terminationHandler });
						result = result
							+(existingRef?string2:string2.replace(/\s*>\s*$/, ` RESOLVE="${ref}">`))
							+(initialValue || '');
					} else if(/>\s*[^<]+$/m.test(string) && /^\s*[^<]*\s*</m.test(nextString)) {
						// textContentSink
						// TODO
						// will set the textContent of the given textNode
						addRef(ref, <Handler>{ handler: maybeHandler, type: 'textContent' });
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
					if(isFunction((maybeHandler as Subject<unknown>).next) || isFunction((maybeHandler as Promise<unknown>).then)) {
						// Promise or observable that will emit attributes later
						addRef(ref, <Handler>{ handler: maybeHandler, type: 'attributeset', attribute: maybeHandler });
					} else if(typeof maybeHandler == 'string') {
						result += maybeHandler;
					} else {
						// FIXME: spread properties and requeue them for re-processing, as if these came from the template
						result += Object.entries(maybeHandler || {}).map(([k, v])=>`${k}="${v}"`).join(' ');
					}
				} else if(Array.isArray(maybeHandler)) {
					// TODO: handle array elements not being just simple strings to join...
					result = resultPlusString +maybeHandler.join('');
				} else if(typeof maybeHandler == 'object') {
					const [strings, args] = Object.entries(maybeHandler)
						.reduce(([strings, args], [k, v]) => [strings.concat(k), args.concat(v)], [<string[]>[], []]);
					result += string +rml(<TemplateStringsArray><unknown>strings, ...args);
				} else {
					result = resultPlusString +maybeHandler;
				}
			}
		} else {
			result = resultPlusString;
		}
	}
	return <HTMLString>result;
}
