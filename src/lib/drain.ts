import type { SinkFunction } from "../types/sink";
import type { EventListenerObject, EventListener, EventListenerFunction } from "../types/dom";
import type { MaybeFuture, Observable, Observer, ObserverErrorFunction, ObserverFunction } from "../types/futures";
import type { RenderingScheduler } from "../types/schedulers";

import { isObservable, isPromise } from "../types/futures";
import { subscriptions } from "../internal-state";
// import renderingScheduler from '../schedulers/ema-animation-frame';
import { toListener } from "../utils/to-listener";

// TODO: what if we have a promise resolving to an observable or the other way around?
// Those atypical combinations may not be automatically flattened...

/**
 * Return the "callable" part of an entity:
 * - the next method of an Observer
 * - the handleEvent method of an EventListenerObject
 * - the function itself, if it's a function
 */
export const callable = <T>(x: (Observer<T> | EventListenerObject<T> | ObserverFunction<T>)) =>
	(x as Observer<T>).next ? (x as Observer<T>).next.bind(x) :
	(x as EventListenerObject<T>).handleEvent ? (x as EventListenerObject<T>).handleEvent.bind(x) :
	(x as (t: T)=>any)
;

// FIXME: remove, use subscribe below instead
export const asap = <T>(fn: ObserverFunction<T> | Observer<T>, arg: MaybeFuture<unknown>) => {
	(<Observable<T>>arg)?.subscribe?.(fn) ??
	(<Promise<T>>arg)?.then?.((fn as Observer<T>).next?.bind(fn) ?? fn) ??
	(fn as ObserverFunction<T>)(arg as T);
};

/**
 * Connect an event source to a sink through any compatible interface on any optionally specified scheduler
 * @param node The node on which the binding is set
 * @param source A Promise, Observable or EventEmitter
 * @param next A "next" or "then" handler on the sink side
 * @param error? An error handler on the sink side
 * @param complete? a finalisation function
 */
export const subscribe = // TODO: rename to bindEvent or something that implies this is for element events
	<T extends Event>
	(node: Node, source: MaybeFuture<T>, next: EventListener<T>, error?: ObserverErrorFunction, complete?: () => void, scheduler?: RenderingScheduler) => {
		// TODO: make this a plugin, in case people don't use handleEvent...
		const flattenedNext = toListener(next);
		const task = scheduler?.(node, <SinkFunction>flattenedNext) ?? flattenedNext;

		if (isObservable(source)) {
			// TODO: should we handle promise cancellations (cancellable promises?) too?
			const subscription = source.subscribe({
				next: <EventListenerFunction>task,
				error,
				complete,
			});

			subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);

			return subscription;
		} else if (isPromise(source)) {
			source.then(<EventListenerFunction>task, error).finally(complete);
		} else {
			// TODO: should we handle function cancellations (removeEventListener) too?
			(<EventListenerFunction>task)(source);
		}
	}
;
