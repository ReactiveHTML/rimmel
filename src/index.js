window.no = {
	// TODO: Test and verify with WeakRef/FinalizationRegistry
	handlers: new WeakMap(),
	iterators: new WeakMap(),
	subscriptions: new WeakSet(),
}

const ROOT = document.documentElement
const nonBubblingAttributes = new Set(['ended', 'play', 'pause', 'volumechange']) // TODO: add more?
const waitingElementHanlders = new Map()
const isFunction = fn => typeof fn == 'function'
const isGeneratorFunction = fn => /function\s*\*/.test(fn)
const isIterable = obj => obj && typeof obj[Symbol.iterator] === 'function';
const getEventName = eventAttributeString => ((/\s+on(?<event>\w+)=['"]?$/.exec(eventAttributeString) || {}).groups || {}).event
// GOTCHA: attributes starting with "on" will be treated as event handlers -------> HERE <---, so don't do <tag ongoing="trouble">
const getEventNameWithoutOn = eventAttributeString => eventAttributeString.replace(/^on/, '')

// set classes from an object {cls: <non falsy value>, cls2: undefined}
const setClasses      = (node, classset) => Object.entries(classset).forEach(([k, v])=>v?node.classList.add(k):node.classList.remove(k))
const setDataset      = (node, dataset) => Object.entries(dataset).forEach(([k, v])=>typeof v == 'undefined' ? node.dataset[k] : node.dataset[k = v])

const innerHTMLSink   = (node)      => html => node.innerHTML=html
const innerTextSink   = (node)      => str  => node.innerText=str
const textContentSink = (node)      => str  => node.textContent=str
const attributeSink   = (node, key) => str  => node.setAttribute(key, str)
// set node attributes from an object {k: v, k2: v2}
const attributesSink  = (node)      => attributeset => Object.entries(attributeset).forEach(([k, v])=>typeof v == 'undefined' ? node.removeAttribute(k) : node.setAttribute(k, v))

const classSink       = (node)      => name => name && (typeof name == 'string' ? node.classList.add(name) : setClasses(node, name))
const datasetSink     = (node, key) => str  => node.dataset[key] = str
const datasetMultiSink= (node, key) => str  => node.dataset[key] = str
const terminationSink = (node)      => node.remove()

const DOMSinks = new Map([
	['innerHTML',    innerHTMLSink],
	['innerText',    innerTextSink],
	['textContent',  textContentSink],
	// TODO: textContent sink
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
		for(var handledTarget=event.target, h=no.handlers.get(event.target);!h && handledTarget;handledTarget=handledTarget.parentNode, h=no.handlers.get(handledTarget))
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
			const isGenerator = isGeneratorFunction(handler)
			if(eventName) {
				// handler is an event source
				// handler is an Rx Subject | Observer | Function
				// <a onclick="${subject}">
				// <a onclick="${()=>doSomething}">
				// handler is a generator function
				// <a onclick="${function* {yield something}}">
				// <a onclick="${async function* {yield await something}}">
				const h = isFunction(handler) || isFunction(handler.next) || isGenerator
				const isNonBubblingEvent = nonBubblingAttributes.has(eventName)
				if(h) {
					if(!isNonBubblingEvent) {
						// Only use event delegation for bubbling events
						// TODO: let users optionally choose if they want to use delegation or not: <a delegated:onclick="..."> <a undelegated:onclick="">
						delegateEvent(eventName)
					}
					addRef(ref, { handler, type: 'event', eventName, isGenerator })
				}
				result += string +(eventName == 'mount' || isNonBubblingEvent ? ref : '') +(existingRef?'':`" RESOLVE="${ref}`)
			} else if((typeof (handler.subscribe || handler.then)  == 'function' || isGenerator) && i<strings.length -1) {
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
					addRef(ref, { handler, type: attributeType, attribute: attributeName, isGenerator })
					result = (result +string +initialValue).replace(/<(\w+)\s+([^>]+)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`)
					//result = result.replace(/([a-z0-9_\-]+=(?<q>['"]?)(?:.*(?!\k<q>)))$/i, `RESOLVE="${ref}" $1`)
				//} else if(/<\s*\S+(?:\s+[^=>]+=(?<q>['"]?)[^\k<q>]*\k<q>)*(?:\s+\.\.\.)?$/.test(result +string) && /^[^<]*>/.test(nextString)) {
				} else if(/<\s*\S+(?:\s+[^=>]+=(?:'[^']*'|"[^"]*"|\S+|[^>]+))(?:\s+\.\.\.)?$/.test(result +string) && /^[^<]*>/.test(nextString)) {
					// <some-tag some-attribute="some-value" ${observable}</some-tag>
					// <some-tag some-attribute="some-value" ...${observable}</some-tag>
					// <some-tag some-attributes ...${observable<dataset>} other-stuff>...</some-tag>
					// will bind multiple attributes and values
					addRef(ref, { handler, type: 'attributeset', isGenerator })
					//result += string.replace(/\.\.\.$/, '') +` RESOLVE="${ref}"`
					result = (result +string).replace(/<(\w+)\s+([^<]+)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`)
				} else if(/>\s*$/.test(string) && /^\s*</.test(nextString)) {
					// <some-tag>${observable}</some-tag>
					// will set innerHTML
					addRef(ref, { handler, type: 'innerHTML', termination: terminationSink, isGenerator })
					result += existingRef?string:string.replace(/\s*>\s*$/, ` RESOLVE="${ref}">`)
				} else if(/>[ \t]*[^<]+$/.test(string) && /^\s*</.test(nextString)) {
					// TODO
					// will set the textNode
					addRef(ref, { handler, type: 'innerText', isGenerator })
					// FIXME: tbd
					result += string +ref
				} else {
					// TODO
					//throw new Error('Panic! WTH now?')
				}
			} else {
				result += string +(Array.isArray(handler)?handler.join(''):handler)
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
					let iterator
					let boundHandler
					const isGenerator = isGeneratorFunction(hand)
					if(isGenerator) {
						if(isEventSource) {
							iterator = hand.bind(node)(node)
							no.iterators.set(hand, iterator)
							const handlerSink = DOMSinks.get(conf.type)(node, conf.attribute)
							boundHandler = (async function(...args) {
								handlerSink(await no.iterators.get(hand).next(...args).value)
							}).bind(node)
						} else {
							boundHandler =
								//isAsyncGenerator ? (async function* (e) {let buffer; while(1) { buffer = yield buffer} }).bind(node) :
								//isGenerator ? (function* (e) {let buffer; while(1) { buffer = yield iterator.next() || buffer } }) :
								isGenerator ? (function bridge(e) { return no.iterators.get(hand).next().value }) :
								isFunction(hand) ? hand.bind(node) :
								isFunction(hand.next) ? hand.next.bind(hand) :
								null
						}
					}

					if(nonBubblingAttributes.has(eventName)) {
						node.addEventListener(eventName, boundHandler)
					} else if(conf.type == 'event' || conf.type == 'source' || key == 'onmount') {
						// if it's an event source (like onclick, etc)
						Object.keys(conf).length && window.no.handlers.set(node, [].concat(window.no.handlers.get(node) || [], {...conf, handler: boundHandler}))
					//} else if(key != 'onmount' && (key != 'resolve' || ['innerHTML', 'innerText', 'attribute', 'attributeset', 'class', 'classset', 'dataset'].includes(conf.type))) {
					} else if(DOMSinks.has(conf.type)) {
						// if it's a sink (innerHTML, innerText, etc)
						// the function to be called when the source emits
						const subscriptionCallback = DOMSinks.get(conf.type)(node, conf.attribute)
						if(isGenerator) {
							// for sync iterators
							//boundHandler = ( function(...args) {
							//	subscriptionCallback(iterator.next(...args).value)
							//}).bind(node)
							// for async iterators
							//conf...
							conf.sinks = conf.sinks || []
							conf.sinks.push(
								(async function(...args) {
									subscriptionCallback(await no.iterators.get(hand).next(...args).value)
								}).bind(node)
							)
						} else {
							const subscription =
								conf.handler.then ? conf.handler.then(subscriptionCallback, conf.error || undefined) :
								conf.handler.subscribe ? conf.handler.subscribe(subscriptionCallback, conf.termination || undefined, conf.error || undefined) :
								() => {}
							window.no.subscriptions.add(subscription)
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

