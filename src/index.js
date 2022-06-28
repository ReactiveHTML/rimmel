// TODO: make it configurable?
const ROOT = document.documentElement

// TODO: Test and verify with WeakRef/FinalizationRegistry
const handlers = new WeakMap()
const subscriptions = new WeakSet()
const waitingElementHanlders = new Map()

const nonBubblingAttributes = new Set(['ended', 'play', 'pause', 'volumechange']) // TODO: add more?
const isFunction = fn => typeof fn == 'function'
const getEventName = eventAttributeString => ((/\s+on(?<event>\w+)=['"]?$/.exec(eventAttributeString) || {}).groups || {}).event
// GOTCHA: attributes starting with "on" will be treated as event handlers -------> HERE <---, so don't do <tag ongoing="trouble">
const getEventNameWithoutOn = eventAttributeString => eventAttributeString.replace(/^on/, '')

// set classes from an object {cls: <non falsy value>, cls2: undefined}
const setClasses      = (node, classset) => Object.entries(classset).forEach(([k, v])=>v?node.classList.add(k):node.classList.remove(k))
const setDataset      = (node, dataset) => Object.entries(dataset).forEach(([k, v])=>typeof v == 'undefined' ? node.dataset[k] : node.dataset[k = v])

const innerHTMLSink   = (node)      => html => node.innerHTML=html
const innerTextSink   = (node)      => str  => node.innerText=str
const styleSink       = (node, key) => {
	const t = node.style //[key];
	return kvp => Object.entries(kvp).forEach(([k, v])=> t[k] = v)
}
const attributeSink   = (node, key) => str  => node.setAttribute(key, str)
// const eventHandlerSink= (node)      => (e, h) => node.addEventListener(e, h)
// set node attributes from an object {k: v, k2: v2}
//const attributesSink  = (node)      => attributeset => Object.entries(attributeset) .forEach(([k, v])=> typeof v == 'undefined' ? node.removeAttribute(k) : typeof v == 'function' ? node.addEventListener(k.replace(/^on/, ''), v) : node.setAttribute(k, v))
const attributesSink  = (node)      => attributeset => Object
	.entries(attributeset)
	.forEach(([k, v])=>
		typeof v == 'undefined'
			? node.removeAttribute(k)
			: k.substr(0, 2) == 'on' && typeof (v.next || v) == 'function'
				? node.addEventListener(k.replace(/^on/, ''), v.next ? v.next.bind(v) : v)
				: typeof v.subscribe == 'function'
					? v.subscribe((DOMSinks.get(k) || attributeSink)(node, k))
					: typeof v.then == 'function'
						? v.then((DOMSinks.get(k) || attributeSink)(node, k))
						: node.setAttribute(k, v))

const classSink       = (node)      => name => name && (typeof name == 'string' ? node.classList.add(name) : setClasses(node, name))
const datasetSink     = (node, key) => str  => node.dataset[key] = str
const datasetMultiSink= (node, key) => str  => node.dataset[key] = str
const terminationSink = (node)      => node.remove()

const DOMSinks = new Map([
	['innerHTML',    innerHTMLSink],
	['innerText',    innerTextSink],
	['style',        styleSink],
	['attribute',    attributeSink],
	['attributeset', attributesSink],
	['class',        classSink],
	['dataset',      datasetSink],
	['multidataset', datasetMultiSink],
// ['termination',  terminationSink],
])

const delegatedEvents = new Set()
const delegateEvent = eventName => {
	if(!delegatedEvents.has(eventName)) {
	document.addEventListener(eventName, event => {
			for(var handledTarget=event.target, h=handlers.get(event.target);!h && handledTarget;handledTarget=handledTarget.parentNode, h=handlers.get(handledTarget))
				// TODO: do we need to support multiple event handlers from multiple parent nodes?
			;
			return (h || [])
				.filter(h=>h.handler && h.eventName==event.type)
				.map(h=>h.handler(event) || false)
				.reduce((a, b)=>a||b, false)
		}
		// doing it once would also need to add it multiple times!
		//, eventName == 'mount' ? {once: true} : undefined)
		)
	delegatedEvents.add(eventName)
	}
}

const addRef = (ref, data) => {
	const t = (waitingElementHanlders.get(ref) || []).concat(data)
	waitingElementHanlders.set(ref, t)
}

let refCount = 0
function render(strings, ...args) {
	let result = ''
	const argsArray = [].concat(args || [])
	for(let i=0;i<strings.length;i++) {
		const string = strings[i]
		const handler = argsArray[i]
		const eventName = getEventName(string)
		const r = (result +string).match(/<\w+\s+[^>]*RESOLVE="(?<existingRef>[^"]+)"\s*[^>]*$/)
		const existingRef = r && r.groups?r.groups.existingRef:undefined
		const ref = existingRef || `#REF${refCount++}`
		if(handler) {
			if(eventName) {
				// handler is an event source
				// handler is an Rx Subject | Observer | Function
				// <a onclick="${subject}">
				// <a onclick="${()=>doSomething}">
				const h = isFunction(handler) ? handler : isFunction(handler.next) ? handler.next.bind(handler) : null
				const isNonBubblingEvent = nonBubblingAttributes.has(eventName)
				if(h) {
					if(!isNonBubblingEvent) {
						// Only use event delegation for bubbling events
					delegateEvent(eventName)
					}
					addRef(ref, { handler: h, type: 'event', eventName })
				}
				result += string +(eventName == 'mount' || isNonBubblingEvent ? ref : '') +(existingRef?'':`" RESOLVE="${ref}`)
				// TODO: set {once: true}?
			} else if(typeof (handler.subscribe || handler.then)  == 'function' && i<strings.length -1 || typeof handler == 'object') {
				// handler is an observable. subscribe to it
				// and set up a sink
				const nextString = strings[i+1]
				//const isAttribute = /(?<attribute>[^ >=]+)=(?<quote>['"]?)$/.exec(result+string)
				const isAttribute = /(?<attribute>[a-z0-9\-_]+)\=(?<quote>['"]?)(?<otherValues>[^"]*)$/.exec(result+string)
				if(isAttribute && new RegExp(`^(?:[^>${isAttribute.groups.quote}]*)${isAttribute.groups.quote}`).test(nextString)) {
					// <some-tag some-attributes another-attribute="${observable}" other-stuff>...</some-tag>
					// <some-tag some-attributes class="some classes ${observable} and more" other-stuff>...</some-tag>
					// <some-tag some-attributes data-xxx="123" data-yyy="${observable}" other-stuff>...</some-tag>
					// will set setAttribute
					let attributeName = isAttribute.groups.attribute
					const attributeType = attributeName == 'class' ? 'class' : !attributeName.indexOf('data') ? 'dataset' : 'attribute'
					if(attributeType == 'dataset') {
						attributeName = attributeName.replace(/^data-/, '')
					}
					const initialValue = ''
					addRef(ref, { handler, type: attributeType, attribute: attributeName })
					result = (result +string +initialValue).replace(/<(\w+)\s+([^>]+)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`)
					//result = result.replace(/([a-z0-9_\-]+=(?<q>['"]?)(?:.*(?!\k<q>)))$/i, `RESOLVE="${ref}" $1`)
				//} else if(/<\s*\S+(?:\s+[^=>]+=(?<q>['"]?)[^\k<q>]*\k<q>)*(?:\s+\.\.\.)?$/.test(result +string) && /^[^<]*>/.test(nextString)) {
				} else if(/<\s*\S+(?:\s+[^=>]+=(?:'[^']*'|"[^"]*"|\S+|[^>]+))*(?:\s+\.\.\.)?$/.test(result +string) && /^(?:[^<]*>|\s+\.\.\.)/.test(nextString)) {
					// inline OBJECT 
					// <some-tag some-attribute="some-value" ${observable}</some-tag>
					// <some-tag some-attribute="some-value" ...${observable}</some-tag>
					// <some-tag some-attributes ...${observable<dataset>} other-stuff>...</some-tag>
					// will bind multiple attributes and values
					addRef(ref, { handler, type: 'attributeset' })
					//result += string.replace(/\.\.\.$/, '') +` RESOLVE="${ref}"`
					result += string.replace(/\.\.\.$/, '')
					result = result.replace(/<\s*(\w+)\s+([^<]*)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`)
				} else if(/>\s*$/.test(string) && /^\s*</.test(nextString)) {
					// <some-tag>${observable}</some-tag>
					// will set innerHTML
					addRef(ref, { handler, type: 'innerHTML', termination: terminationSink })
					result += existingRef?string:string.replace(/\s*>\s*$/, ` RESOLVE="${ref}">`)
				} else if(/>[ \t]*[^<]+$/.test(string) && /^\s*</.test(nextString)) {
					// TODO
					// will set the textNode
					addRef(ref, { handler, type: 'innerText' })
					// FIXME: tbd
					result += string +ref
				} else {
					// TODO
					//throw new Error('Panic! WTH now?')
					result += string
					// ???
				}
			} else if(/\.\.\.$/.test(string)) {
				// ...${attributesObject}
				// ...${attributesPromise}
				// ...${attributesObservable}
				result += string.substr(0, string.length -3)
				if(isFunction(handler.next) || isFunction(handler.then)) {
					// Promise or observable that will emit attributes later
					addRef(ref, { handler, type: 'attributeset', attribute: handler })
				} else {
					// FIXME: spread properties and requeue them for re-processing, as if these came from the template
					result += Object.entries(handler || {}).map(([k, v])=>`${k}="${v}"`).join(' ')
				}
			} else if(Array.isArray(handler)) {
				result += string +handler.join('')
			} else if(typeof handler == 'object') {
				const [strings, args] = Object.entries(handler).reduce(([strings, args], [k, v]) => [strings.concat(k), args.concat(v)], [[], []])
				result += string +render(strings, ...args)
			} else {
				result += string +handler
			}
		} else {
			result += string
		}
	}
	return result
}

function transferAttributes(node) {
	([].concat(...node.attributes || []))
		.forEach(attr=>{
			const key = attr.nodeName
			const value = attr.nodeValue
			const eventName = key.replace(/^on/, '')
			const isEventSource = eventName !== key

			if(/^#REF/.test(value) || key == 'onmount' || isEventSource) {
				node.removeAttribute(key);

				(waitingElementHanlders.get(value) || []).forEach(conf => {
					const hand = conf.handler
					const boundHandler = isFunction(hand) ? hand.bind(node) : isFunction(hand.next) ? hand.next.bind(hand) : null

					if(nonBubblingAttributes.has(eventName)) {
						node.addEventListener(eventName, boundHandler)
					} else if(conf.type == 'event' || conf.type == 'source' || key == 'onmount') {
						// if it's an event source (like onclick, etc)
						Object.keys(conf).length && handlers.set(node, [].concat(handlers.get(node) || [], {...conf, handler: boundHandler}))
					//} else if(key != 'onmount' && (key != 'resolve' || ['innerHTML', 'innerText', 'attribute', 'attributeset', 'class', 'classset', 'dataset'].includes(conf.type))) {
					} else if(conf.type == 'attributeset') {
						attributesSink(node)(hand) // merge attributes in // some could have gone in earlier, e.g.: class, or other attributes, but will after mount. Is that ok?
					} else {
						if(DOMSinks.has(conf.type)) { // if it's a sink (innerHTML, etc)
							const subscriptionCallback = DOMSinks.get(conf.type)(node, conf.attribute)
							const subscription =
								conf.handler.then ? conf.handler.then(subscriptionCallback).catch(conf.error || undefined) :
								conf.handler.subscribe ? conf.handler.subscribe(subscriptionCallback, conf.termination || undefined, conf.error || undefined) :
								() => {}
							subscriptions.add(subscription)
						}
					}
				})
				waitingElementHanlders.delete(value)

				if(key == 'onmount') {
					setTimeout(()=>node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}})), 0)
					//node.dispatchEvent(new CustomEvent('mount', {bubbles: true, detail: {}}))
				}
			}
		})
}

// TODO: unmount and unsubscribe as necessary. Some stuff will not need to, because of the WeakSet
function mount(mutationsList, observer) {
	mutationsList
		.filter(m=>m.type === 'childList')
		.flatMap(m=>([...m.addedNodes]))
		.filter(m=>m.nodeType == 1) // element
		.flatMap(node=>([node].concat(...node.querySelectorAll('[RESOLVE]'))))
		.forEach(transferAttributes)
}

(new MutationObserver(mount))
	.observe(ROOT, { attributes: false, childList: true, subtree: true })

export {
	render
}

