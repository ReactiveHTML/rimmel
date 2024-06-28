import { AnySink } from "../sinks/any-sink";
import { isObservable, isPromise, MaybeFuture, Observable, Present } from "../types/futures";
import { isFunction } from "../utils/is-function";
import { subscriptions } from "../internal-state";

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
export const subscribe = <T>(node: Element, source: MaybeFuture<T>, nextFn: (t: T) => any, catchFn?: (e: Error) => void, endFn?: () => void) => {
	if (isObservable(source)) {
		// TODO: should we handle promise cancellations (cancellable promises?) too?
		// TODO: should we handle function cancellations (removeEventListener) too?
		const subscription = source.subscribe(nextFn, catchFn, endFn);
		subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);
		return subscription;
	} else if (isPromise(source)) {
		source.then(nextFn).catch(catchFn).finally(endFn);
	} else {
		nextFn(source);
	}
}

// /**
//  * Connect a raw or processed event source to a consumer
//  * @param node The current node on which the binding is set
//  * @param source A Promise, Observable, function or object
//  * @param nextFn A "next" or "then" handler on the sink side
//  * @param catchFn? An error handler on the sink side
//  * @param endFn? a finalisation function
//  */
// export const ___prescribe = <T>(node: Element, source: MaybeFuture<T>, nextFn: (t: T) => any, catchFn?: (e: Error) => void, endFn?: () => void) => {
// 	if (isObservable(source)) {
// 		// TODO: should we handle promise cancellations (cancellable promises?) too?
// 		// TODO: should we handle function cancellations (removeEventListener) too?
// 		const subscription = source.subscribe(nextFn, catchFn, endFn);
// 		subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);
// 		return subscription;
// 	} else {
// 		isPromise(source) ? source.then(nextFn).catch(catchFn).finally(endFn) :
// 			isFunction(source) ? source(node) :
// 			isFunction(nextFn) ? nextFn(source) :
// 			// typeof source == 'object' ? sinkFactory(node)(source) :
// 			null
// 		// AnySink(node)(source)
// 	}
// }

// /**
//  * Connect a raw or processed event source to a consumer
//  * @param node The current node on which the binding is set
//  * @param source A Promise, Observable, function or object
//  * @param nextFn A "next" or "then" handler on the sink side
//  * @param catchFn? An error handler on the sink side
//  * @param endFn? a finalisation function
//  */
// export const superscribe = <T>(source: MaybeFuture<T>, nextFn: (t: T) => any, catchFn?: (e: Error) => void, endFn?: () => void) => {
// 	if (isObservable(source)) {
// 		// TODO: should we handle promise cancellations (cancellable promises?) too?
// 		// TODO: should we handle function cancellations (removeEventListener) too?
// 		const subscription = source.subscribe(nextFn, catchFn, endFn);
// 		subscriptions.get(node)?.push(subscription) ?? subscriptions.set(node, [subscription]);
// 		return subscription;
// 	} else {
// 		isPromise(source) ? source.then(nextFn).catch(catchFn).finally(endFn) :
// 			isFunction(source) ? source(node) :
// 			isFunction(nextFn) ? nextFn(source) :
// 			// typeof source == 'object' ? sinkFactory(node)(source) :
// 			null
// 		// AnySink(node)(source)
// 	}
// }
// 
