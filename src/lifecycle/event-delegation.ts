import type { RMLEventName } from "../types/dom";
import { RML_DEBUG } from "../constants";

// #IFDEF DEBUG
import { tracing } from "../debug";
// #ENDIF
import { delegatedEvents, delegatedEventHandlers } from "../internal-state";

export const delegateEvent = (eventName: RMLEventName) => {
	if (!delegatedEvents.has(eventName)) {
		// TODO: allow registering deletegated event handlers at different levels than document
		// TODO: register at root element level, instead of document?
		document.addEventListener(eventName, (event: Event) => {
			for (
				var handledTarget = event.target, h = delegatedEventHandlers.get(event.target as Element);
				// TODO: use a Map to avoid h.some(conf=>conf.eventName == event.type)
				handledTarget && !(h && h.some(conf => conf.eventName == event.type));
				handledTarget = (handledTarget as Element).parentNode, h = delegatedEventHandlers.get(handledTarget as Element)
			); // FIXME: this is an empty for... got a bit too long. Maybe change it to a while loop?

			// (h ?? [])
				// TODO: check if we can ensure h.handler always exists and stop checking it here every time
				h?.filter(h => h.listener && h.eventName == event.type)
				// TODO: map data sources here
				//.forEach(h => (<Function>h.handler)(event))
				.forEach(h => {
					// #IFDEF DEBUG
					if(tracing && (<Element>event?.target)?.hasAttribute(RML_DEBUG)) {
						console.groupCollapsed('RML: Sourced', event.type, event.target);
						console.dir(event);
						console.dir(h.listener);
						console.groupEnd();
					}
					// #ENDIF
					// (<Function>h.listener)(event)
					(<Function>h.listener).call(event.target, event) // might break observables???
				})
			;
		},
			// doing it once would also need to add it multiple times!
			//, eventName == 'mount' ? {once: true} : undefined)
			// Are we capturing to also catch non-bubbling events?
			{ capture: true }
		);
		delegatedEvents.add(eventName);
	}
};
