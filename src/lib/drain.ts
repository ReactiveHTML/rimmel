import type { SinkFunction } from "../types/sink";
import type { EventListenerOrEventListenerObject } from "../types/dom";
import type { MaybeFuture, Observable, Present } from "../types/futures";
import { isObservable, isPromise } from "../types/futures";
import { subscriptions } from "../internal-state";

export const asap = (fn: SinkFunction, arg: MaybeFuture<unknown>) => {
    (<Observable<unknown>>arg)?.subscribe?.(fn) ??
    (<Promise<unknown>>arg)?.then?.(fn) ??
    fn(arg);
};

/**
 * Call the given fn() with data, either now, or on subscription if it's a future.
 * source.subscribe(fn)
 * source.then(fn)
 * fn(source)
 **/
export const consecute = <T>(fn: (t: T) => void, source: MaybeFuture<T>) => {
	// TODO: add catch and complete handlers, too
	// source.subscribe(nextFn, catchFn, endFn);
	const subscription =
		(<Observable<T>>source)?.subscribe?.(fn)
		?? (<Promise<T>>source)?.then?.(fn)
		// ?? fn(source) ????
	;

	if(subscription) {
		// subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);
	} else {
		fn(<Present<T>>source);
	}
	return subscription;
};

/**
 * Connect a source to a sink through a compatible interface
 * @param node The current node on which the binding is set
 * @param source A Promise, Observable, function or object
 * @param nextFn A "next" or "then" handler on the sink side
 * @param catchFn? An error handler on the sink side
 * @param endFn? a finalisation function
 */
export const subscribe = <T extends Event>(node: Node, source: MaybeFuture<T>, nextFn: EventListenerOrEventListenerObject<T>, catchFn?: (e: Error) => void, endFn?: () => void) => {
	if (isObservable(source)) {
		// TODO: should we handle promise cancellations (cancellable promises?) too?
		// TODO: should we handle function cancellations (removeEventListener) too?
		const subscription = source.subscribe({
			next: <EventListener>nextFn,
			error: catchFn,
			complete: endFn
		});
		subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);
		return subscription;
	} else if (isPromise(source)) {
		source.then(<EventListener>nextFn).catch(catchFn).finally(endFn);
	} else {
		(<EventListener>nextFn)(source);
	}
}
