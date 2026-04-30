import type { NextObserver, OperatorFunction } from 'rxjs';
import type { OperatorPipeline } from '../types';
import type { Consumer } from '../types/futures';

import { inputPipe, pipeIn } from '../utils/input-pipe';

/**
 * Create a reverse-curried observable for a target stream
 * by applying an input pipeline in front of it
 * @param pipeline an array of RxJS operators
 * @param destination the target stream to feed
 * @returns An Observer if both pipeline and destination are supplied
 *   or a curried function that takes a stream to return the above.
 * @example
 * ```ts
 * const target = new Subject<number>;
 * 
 * // an event adapter that feeds the value of an HTML input
 * // this will return a function that takes a target stream
 * // as a parameter
 * const Value = korma([
 *   map(e => e.target.value),
 * ]);
 * 
 * rml`<input onchange="${Value(target)}">`
 * ```
 * 
 * * @example
 * ```ts
 * const target = new Subject<number>;
 * 
 * // an event adapter that feeds the value of an HTML input
 * const ValueFeeder = korma([
 *   map(e => e.target.value),
 * ], target);
 * 
 * rml`<input onchange="${valueFeeder}">`
 **/
export function korma<I, O = I>(pipeline: []): (destination: Consumer<O>) => NextObserver<I>;

export function korma<I, A>(pipeline: [OperatorFunction<I, A>]): (destination?: Consumer<A>) => NextObserver<I>;
export function korma<I, A, B>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>]): (destination?: Consumer<B>) => NextObserver<I>;
export function korma<I, A, B, C>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>]): (destination?: Consumer<C>) => NextObserver<I>;
export function korma<I, A, B, C, D>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>]): (destination?: Consumer<D>) => NextObserver<I>;
export function korma<I, A, B, C, D, E>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>]): (destination?: Consumer<E>) => NextObserver<I>;
export function korma<I, A, B, C, D, E, F>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>]): (destination?: Consumer<F>) => NextObserver<I>;
export function korma<I, A, B, C, D, E, F, G>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>, OperatorFunction<F, G>]): (destination?: Consumer<G>) => NextObserver<I>;
export function korma<I, A, B, C, D, E, F, G, H>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>, OperatorFunction<F, G>, OperatorFunction<G, H>]): (destination?: Consumer<H>) => NextObserver<I>;
export function korma<I, A, B, C, D, E, F, G, H, J>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>, OperatorFunction<F, G>, OperatorFunction<G, H>, OperatorFunction<H, J>]): (destination?: Consumer<J>) => NextObserver<I>;
export function korma<I, O = I>(pipeline: OperatorPipeline<I, O>): (destination?: Consumer<O>) => NextObserver<I>;

export function korma<I, O = I>(pipeline: [], destination?: Consumer<O>): NextObserver<I>;
export function korma<I, A>(pipeline: [OperatorFunction<I, A>], destination?: Consumer<A>): NextObserver<I>;
export function korma<I, A, B>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>], destination?: Consumer<B>): NextObserver<I>;
export function korma<I, A, B, C>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>], destination?: Consumer<C>): NextObserver<I>;
export function korma<I, A, B, C, D>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>], destination?: Consumer<D>): NextObserver<I>;
export function korma<I, A, B, C, D, E>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>], destination?: Consumer<E>): NextObserver<I>;
export function korma<I, A, B, C, D, E, F>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>], destination?: Consumer<F>): NextObserver<I>;
export function korma<I, A, B, C, D, E, F, G>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>, OperatorFunction<F, G>], destination?: Consumer<G>): NextObserver<I>;
export function korma<I, A, B, C, D, E, F, G, H>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>, OperatorFunction<F, G>, OperatorFunction<G, H>], destination?: Consumer<H>): NextObserver<I>;
export function korma<I, A, B, C, D, E, F, G, H, J>(pipeline: [OperatorFunction<I, A>, OperatorFunction<A, B>, OperatorFunction<B, C>, OperatorFunction<C, D>, OperatorFunction<D, E>, OperatorFunction<E, F>, OperatorFunction<F, G>, OperatorFunction<G, H>, OperatorFunction<H, J>], destination?: Consumer<J>): NextObserver<I>;
export function korma<I, O = I>(pipeline: OperatorPipeline<I, O>, destination?: Consumer<O>): NextObserver<I>;

export function korma<I, O = I>(pipeline: OperatorPipeline<I, O>, destination?: Consumer<O>) {
	return destination === undefined
		? (inputPipe as any)(...pipeline)
		: (pipeIn as any)(destination, ...pipeline);
};
