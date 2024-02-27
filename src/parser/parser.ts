import { Handler, InlineAttributeHandler, MaybeHandler } from "../types/internal";
import { HTMLString, RMLEventAttributeName, RMLEventName } from "../types/dom";
import { waitingElementHanlders } from "../internal-state";
import { isFunction } from "../utils/is-function";
import { BehaviorSubject, Observable, Subject } from "../types/futures";
import { nonBubblingAttributes } from "../lifecycle/lifecycle-handler";
import { delegateEvent } from "../lifecycle/event-delegation";
import { errorSink } from "../sinks/error-sink";
import { terminationSink } from "../sinks/termination-sink";

// FIXME: can this be removed by linters?
const sinkSpecifierPattern = /\s*<!--\s*SINK:\s*(\w+)\s*-->\s*$/;

let refCount = 0;

const addRef = (ref: string, data: Handler) => {
	const t = (waitingElementHanlders.get(ref) || []).concat(data);
	waitingElementHanlders.set(ref, t);
};

const getEventName = (eventAttributeString: RMLEventAttributeName): RMLEventName | undefined => <RMLEventName>/\s+on(?<event>\w+)=['"]?$/.exec(eventAttributeString)?.groups?.event;
// GOTCHA: attributes starting with "on" will be treated as event handlers ------------------------------------> HERE <------------------------, so don't do <tag ongoing="trouble">

export default function rml(strings: TemplateStringsArray, ...args: MaybeHandler[]): HTMLString {
	let result = '';
	for(let i=0;i<strings.length;i++) {
		const string = strings[i];
		const resultPlusString = result +string;
		const lastTag = resultPlusString.lastIndexOf('<');
		const maybeHandler: MaybeHandler = args[i];
		const initialValue = (maybeHandler as BehaviorSubject<unknown>)?.value; // if it's a BehaviorSubject, pick its initial/current value to render it synchronously
		const eventName = getEventName(string as RMLEventAttributeName);
		const r = (resultPlusString).match(/<\w+\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*(?:\s*>\s*)?$/);
		const existingRef = r && r.groups?r.groups.existingRef:undefined;
		const ref = existingRef || `#REF${refCount++}`;

		//const context =
		//		/>\s*$/.test(string) && /^\s*<\s*/.test(nextString) ? 'child'
		//		: /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString) ? 'attribute'

		if(maybeHandler) {
			if(eventName) {
				// handler is an event source
				// handler is an Rx Subject | Observer | Function
				// <a onclick="${subject}">
				// <a onclick="${()=>doSomething}">
				const h = isFunction(maybeHandler) ? maybeHandler
					: isFunction(maybeHandler.next) ? maybeHandler.next.bind(maybeHandler)
					: null;
				const isNonBubblingEvent = nonBubblingAttributes.has(eventName);
				if(h) {
					// Only use event delegation for bubbling events
					isNonBubblingEvent || delegateEvent(eventName);
					addRef(ref, { handler: h, type: 'event', eventName });
				}
				result = resultPlusString +(eventName == 'mount' || isNonBubblingEvent ? ref : '') +(existingRef?'':`" RESOLVE="${ref}`);
				// TODO: set {once: true}?
			} else if(maybeHandler.sink) {
				// Custom/user-defined sink
				addRef(ref, <Handler>{ handler: maybeHandler, type: maybeHandler.sink });
					// FIXME: wrong regexp, will only work for a whole tag
				result = result + string.replace(/<(\w+)\s*([^>]*)/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
			} else if(typeof ((<Observable<unknown>>maybeHandler).subscribe ?? (<Promise<unknown>>maybeHandler).then)  == 'function' && i<strings.length -1 || typeof maybeHandler == 'object' || maybeHandler.sink) {
				// handler is an observable. subscribe to it
				// and set up a sink
				const nextString = strings[i+1];
				//const isAttribute = /(?<attribute>[^ >=]+)=(?<quote>['"]?)$/.exec(resultPlusString)
				const isAttribute = /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(resultPlusString);
				if(isAttribute && new RegExp(`^(?:[^>${isAttribute.groups?.quote}]*)${isAttribute.groups?.quote}`).test(nextString)) {
					// <some-tag some-attributes another-attribute="${observable}" other-stuff>...</some-tag>
					// <some-tag some-attributes class="some classes ${observable} and more" other-stuff>...</some-tag>
					// <some-tag some-attributes data-xxx="123" data-yyy="${observable}" other-stuff>...</some-tag>
					// will set setAttribute
					let attributeName = isAttribute.groups?.attribute ?? '';
					const attributeType =
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
					result = (resultPlusString +initialValue).replace(/<(\w+)\s+([^>]+)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
					//result = result.replace(/([a-z0-9_\-]+=(?<q>['"]?)(?:.*(?!\k<q>)))$/i, `RESOLVE="${ref}" $1`)
				//} else if(/<\s*\S+(?:\s+[^=>]+=(?<q>['"]?)[^\k<q>]*\k<q>)*(?:\s+\.\.\.)?$/.test(resultPlusString) && /^[^<]*>/.test(nextString)) {
				} else if(/<\s*\S+(?:\s+[^=>]+(?:=(?:'[^']*'|"[^"]*"|\S+|[^>]+)))*(?:\s+\.\.\.)?$/.test(resultPlusString.substring(lastTag)) && /^(?:[^<]*>|\s+\.\.\.)/.test(nextString)) {
					// inline OBJECT 
					// <some-tag some-attribute="some-value" ${observable}</some-tag>
					// <some-tag some-attribute="some-value" ...${observable}</some-tag>
					// <some-tag some-attributes ...${observable<dataset>} other-stuff>...</some-tag>
					// will bind multiple attributes and values

					//result += string.replace(/\.\.\.$/, '') +` RESOLVE="${ref}"`
					// console.log('INLINE OBJECT', string, maybeHandler);
					result += string.replace(/\.\.\.$/, '');

					if(true) {
						addRef(ref, <InlineAttributeHandler>{ handler: maybeHandler, type: 'attributeset', attribute: maybeHandler });
					} else {
						result += Object.entries(maybeHandler || {}).map(([k, v])=>`${k}="${v}"`).join(' ');
						//addRef(ref, { handler, type: 'attributeset' })
					}

					result = result.replace(/<\s*(\w+)\s+([^<]*)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`);
				} else if(/>\s*$/.test(string) && /^\s*<\s*/.test(nextString)) {
					// <some-tag>${observable}</some-tag>
					// will set innerHTML
					let sinkType; // TODO: maybe stop using a string that needs looking up?
					let string2: string;

					string2 = string.replace(sinkSpecifierPattern, '');
					//sinkType = RegExp.$1 || 'collection' || 'innerHTML'
					sinkType = RegExp.$1 || maybeHandler.sink || 'innerHTML';
console.log('xxxx SINK TYPE:', sinkType, maybeHandler)

					// if(sinkSpecifierPattern.test(string)) {
					// 	sinkType = RegExp.$1 || 'appendHTML' // TODO: maybe use DOMSinks.get('appendHTML'), etc, everywhere, instead of strings?
					// 	string2 = string.replace(sinkSpecifierPattern, '')
					// } else {
					// 	sinkType = 'innerHTML'
					// 	string2 = string
					// }

					// FIXME: .skip(1) is RxJS<=5 specific. No dependencies here, pls
					addRef(ref, <Handler>{ handler: initialValue && maybeHandler.skip ? maybeHandler.skip(1) : maybeHandler, type: sinkType, error: errorSink, ...sinkType == 'collection' && {attribute: maybeHandler} || {}, termination: terminationSink });
					result += existingRef?string2:string2.replace(/\s*>\s*$/, ` RESOLVE="${ref}">`)
						+(initialValue || '');
				} else if(/>\s*[^<]+$/m.test(string) && /^\s*[^<]*\s*</m.test(nextString)) {
					// TODO
					// will set the textContent of the given textNode
					addRef(ref, <Handler>{ handler: maybeHandler, type: 'textContent' });
					// FIXME: tbd
					result = existingRef?resultPlusString:result +string.replace(/\s*>/, ` RESOLVE="${ref}">`) +ref;
				} else {
					// TODO
					//throw new Error('Panic! WTH now?')
					result = resultPlusString;
					// ???
				}
			} else if(/\.\.\.$/.test(string)) {
				// ...${attributesObject}
				// ...${attributesPromise}
				// ...${attributesObservable}
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
					.reduce(([strings, args], [k, v]) => [strings.concat(k), args.concat(v)], [[], []]);
				result += string +rml(<TemplateStringsArray><unknown>strings, ...args);
			} else {
				result = resultPlusString +maybeHandler;
			}
		} else {
			result = resultPlusString;
		}
	}
	return <HTMLString>result;
}
