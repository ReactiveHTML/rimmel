import type { SinkFunction } from "../types/sink";
import type { EventListenerOrEventListenerObject } from "../types/dom";
import type { MaybeFuture, Observable, Present } from "../types/futures";

import { isObservable, isPromise } from "../types/futures";
import { subscriptions } from "../internal-state";

// FIXME: remove, use subscribe below instead
export const asap = (fn: SinkFunction, arg: MaybeFuture<unknown>) => {
    (<Observable<unknown>>arg)?.subscribe?.(fn) ??
    (<Promise<unknown>>arg)?.then?.(fn) ??
    fn(arg);
};

/**
 * Connect a source to a sink through a compatible interface
 * @param node The node on which the binding is set
 * @param source A Promise, Observable or EventEmitter
 * @param next A "next" or "then" handler on the sink side
 * @param error? An error handler on the sink side
 * @param complete? a finalisation function
 */
export const subscribe =
	<T extends Event>
	(node: Node, source: MaybeFuture<T>, next: EventListenerOrEventListenerObject<T>, error?: (e: Error) => void, complete?: () => void) => {
		if (isObservable(source)) {
			// TODO: should we handle promise cancellations (cancellable promises?) too?
			const subscription = source.subscribe({
				next: <EventListener>next,
				error,
				complete,
			});

			subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);

			return subscription;
		} else if (isPromise(source)) {
			source.then(<EventListener>next, error).finally(complete);
		} else {
			// TODO: should we handle function cancellations (removeEventListener) too?
			(<EventListener>next)(source);
		}
	}
;
