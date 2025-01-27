import type { SinkFunction } from "../types/sink";
import type { EventListenerObject, EventListenerOrEventListenerObject } from "../types/dom";
import type { MaybeFuture, Observable, Observer } from "../types/futures";

import { isObservable, isPromise } from "../types/futures";
import { subscriptions } from "../internal-state";
import renderingScheduler from '../schedulers/ema-animation-frame';

/**
 * Return the "callable" part of an entity:
 * - the next method of an Observer
 * - the handleEvent method of an EventListenerObject
 * - the function itself, if it's a function
 */
export const callable = <T>(x: (Observer<T> | EventListenerObject<T> | ((t: T)=>any))) =>
  (x as Observer<T>).next ?
    (x as Observer<T>).next.bind(x) :
  (x as EventListenerObject<T>).handleEvent ?
    (x as EventListenerObject<T>).handleEvent.bind(x) :
  (x as (t: T)=>any)
;


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
	(node: Node, source: MaybeFuture<T>, next: EventListenerOrEventListenerObject<T>, error?: (e: Error) => void, complete?: () => void, scheduler = renderingScheduler) => {

		// TODO: make this a plugin, in case people don't use anything with handleEvent...
		const flattenedNext = (next as EventListenerObject<T>).handleEvent?.bind(next) ?? next;
		const task = scheduler?.(node, <SinkFunction>flattenedNext) ?? flattenedNext;

		if (isObservable(source)) {
			// TODO: should we handle promise cancellations (cancellable promises?) too?
			const subscription = source.subscribe({
				next: <EventListener>task,
				error,
				complete,
			});

			subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);

			return subscription;
		} else if (isPromise(source)) {
			source.then(<EventListener>task, error).finally(complete);
		} else {
			// TODO: should we handle function cancellations (removeEventListener) too?
			(<EventListener>task)(source);
		}
	}
;
