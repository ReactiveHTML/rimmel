import { delegatedEvents, handlers } from "../internal-state"
import { HandlerFunction } from "../types/internal"
import { HTMLEventName } from "../types/dom"

export const delegateEvent = (eventName: HTMLEventName) => {
	if(!delegatedEvents.has(eventName)) {
		// TODO: allow registering deletegated event handlers at different levels than document
		// TODO: register at root element level
		document.addEventListener(eventName, (event: Event) => {
			for(var handledTarget=event.target, h=handlers.get(event.target as HTMLElement);handledTarget && !(h && h.some(conf=>conf.eventName == event.type));handledTarget=(handledTarget as HTMLElement).parentNode, h=handlers.get(handledTarget as HTMLElement))
				// TODO: traverse in memory vs the DOM?
				;
			return (h || [])
				.filter(h=>h.handler && h.eventName==event.type)
				.map(h=>(<HandlerFunction>h.handler)(event, handledTarget) || true)
				.reduce((a, b)=>a&&b, true)
		},
		// doing it once would also need to add it multiple times!
		//, eventName == 'mount' ? {once: true} : undefined)
		{capture: true}
		)
		delegatedEvents.add(eventName)
	}
}
