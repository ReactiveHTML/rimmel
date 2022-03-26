window.no = {
	handlers: new WeakMap(),
	subscriptions: new WeakSet(),
}

const ROOT = document.documentElement
const TERMINATE_ON_ERROR = false
const waitingElementHanlders = new Map()
const isFunction = fn => typeof fn == 'function'
const getEventName = eventAttributeString => ((/\s+on(?<event>\w+)=['"]?$/.exec(eventAttributeString) || {}).groups || {}).event
// GOTCHA: attributes starting with "on" will be treated as event handlers -------> HERE <---, so don't do <tag ongoing="trouble">
const getEventNameWithoutOn = eventAttributeString => eventAttributeString.replace(/^on/, '')

// set classes from an object {cls: <non falsy value>, cls2: undefined}
const setClasses      = (node, classset) => Object.entries(classset).forEach(([k, v])=>v?node.classList.add(k):node.classList.remove(k))
const setDataset      = (node, dataset) => Object.entries(dataset).forEach(([k, v])=>typeof v == 'undefined' ? node.dataset[k] : node.dataset[k = v])

const innerHTMLSink   = (node)      => html => node.innerHTML=html
const innerTextSink   = (node)      => str  => node.innerText=str
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
	if(delegatedEvents.has(eventName)) {
		return
	}
	document.addEventListener(eventName, event => {
		for(var handledTarget=event.target, h=no.handlers.get(event.target);!h && handledTarget;handledTarget=handledTarget.parentNode, h=no.handlers.get(handledTarget))
			;
		return h && h.handler && h.eventName==event.type && h.handler(event) || false
	})
	delegatedEvents.add(eventName)
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
				if(h) {
					delegateEvent(eventName)
					addRef(ref, { handler: h, type: 'event', eventName })
				}
				result += string +(h?'':h) +(existingRef?'':`" RESOLVE="${ref}`)
			} else if(typeof (handler.subscribe || handler.then)  == 'function' && i<strings.length -1) {
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
				} else if(/<\s*\S+(?:\s+[^=>]+=(?<q>['"]?)[^\k<q>]*\k<q>)*(?:\s+\.\.\.)?$/.test(result +string) && /^(?:[^<]*>|\s*[a-z0-9\-]+=)/.test(nextString)) {
					// <some-tag some-attribute="some-value" ${observable}</some-tag>
					// <some-tag some-attribute="some-value" ...${observable}</some-tag>
					// <some-tag some-attributes ...${observable<dataset>} other-stuff>...</some-tag>
					// will bind multiple attributes and values
					addRef(ref, { handler, type: 'attributeset' })
					//result += string.replace(/\.\.\.$/, '') +` RESOLVE="${ref}"`
					result = (result +string).replace(/<(\w+)\s+([^<]+)$/, `<$1 ${existingRef?'':`RESOLVE="${ref}" `}$2`)
				} else if(/>\s*$/.test(string) && /^\s*</.test(nextString)) {
					// <some-tag>${observable}</some-tag>
					// will set innerHTML
					addRef(ref, { handler, type: 'innerHTML', xtermination: terminationSink })
					result += existingRef?string:string.replace(/\s*>\s*$/, ` RESOLVE="${ref}">`)
				} else if(/>[ \t]*[^<]+$/.test(string) && /^\s*</.test(nextString)) {
					// TODO
					// will set the textNode
					addRef(ref, { handler, type: 'innerText' })
					// FIXME: tbd
					result += string +ref
				} else {
					// TODO
					throw new Error('Panic! WTH now?')
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
			if(/^#REF/.test(value)) {
				if(key == 'resolve') {
					//node.removeAttribute(key)
				} else {
					node.setAttribute(key, '')
				}

				(waitingElementHanlders.get(value) || []).forEach(conf => {
					if(key != 'resolve' || ['innerHTML', 'innerText', 'attribute', 'attributeset', 'class', 'classset', 'dataset'].includes(conf.type)) {
						if(DOMSinks.has(conf.type)) { // if it's a sink (innerHTML, etc)
							const subscriptionCallback = DOMSinks.get(conf.type)(node, conf.attribute)
							const subscription =
								conf.handler.then ? conf.handler.then(subscriptionCallback, conf.error || undefined) :
								conf.handler.subscribe ? conf.handler.subscribe(subscriptionCallback, conf.termination || undefined, TERMINATE_ON_ERROR && conf.error || undefined) :
								() => {}
							window.no.subscriptions.add(subscription)
						}
					} else if(conf.type == 'event' || conf.type == 'source') {
						// if it's an event source (like onclick, etc)
						Object.keys(conf).length && window.no.handlers.set(node, conf)
					}
				})
				waitingElementHanlders.delete(value)
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

