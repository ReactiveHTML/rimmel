import type { Observer, OperatorPipeline } from '../types/futures';
import type { RMLTemplateExpressions } from '../types/internal';

import { Observable, OperatorFunction, Subject } from 'rxjs';

type Target<O> = RMLTemplateExpressions.TargetEventHandler<O>;
type InputObserver<I> = Observer<I> & { next: (value: I) => void };

const pipeInFromArray = <I, O>(target: Target<O>, pipeline: OperatorFunction<any, any>[]): InputObserver<I> => {
	const source = new Subject<I>();
	const stream = pipeline.reduce(
		(input, operator) => operator(input),
		source as Observable<any>,
	) as Observable<O>;

	stream
		.subscribe(target as Observer<O>)
	;

	// FIXME: will we need to unsubscribe? Then store a reference for unsubscription
	// TODO: can we/should we delay subscription until mounted? Could miss the first events otherwise
	// TODO: check if a Subject is needed, or if we can connect directly to the target (e.g. w/ Observature.addSource)

	return source;
};

const sinkFromArray = <I, O>(source: Observable<I>, pipeline: OperatorFunction<any, any>[]) =>
	pipeline.reduce(
		(input, operator) => operator(input),
		source as Observable<any>,
	) as Observable<O>;

/**
 * Create an "input pipe" by prepending operators to the input of an Observer, Subject, BehaviorSubject, or plain subscriber function.
 * This works the opposite of RxJS's pipe(), which works on the output of an Observable.
**/
export function pipeIn<I>(target: Target<I>): InputObserver<I>;
export function pipeIn<I, A>(target: Target<A>, op1: OperatorFunction<I, A>): InputObserver<I>;
export function pipeIn<I, A, B>(target: Target<B>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>): InputObserver<I>;
export function pipeIn<I, A, B, C>(target: Target<C>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): InputObserver<I>;
export function pipeIn<I, A, B, C, D>(target: Target<D>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): InputObserver<I>;
export function pipeIn<I, A, B, C, D, E>(target: Target<E>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): InputObserver<I>;
export function pipeIn<I, A, B, C, D, E, F>(target: Target<F>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): InputObserver<I>;
export function pipeIn<I, A, B, C, D, E, F, G>(target: Target<G>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): InputObserver<I>;
export function pipeIn<I, A, B, C, D, E, F, G, H>(target: Target<H>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): InputObserver<I>;
export function pipeIn<I, A, B, C, D, E, F, G, H, J>(target: Target<J>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, J>): InputObserver<I>;
export function pipeIn<I, O = I>(target: Target<O>, ...pipeline: OperatorPipeline<I, O>): InputObserver<I>;
export function pipeIn<I, O = I>(target: Target<O>, ...pipeline: OperatorPipeline<I, O>): InputObserver<I> {
	return pipeInFromArray<I, O>(target, pipeline as OperatorFunction<any, any>[]);
}

/**
 * Create an "input pipeline" by prepending operators to the input of an Observer
 *
 * @remarks This works the opposite of the `pipe()` function in RxJS, which
 * attaches operators to the output of an Observable.
 *
 * You normally use an input pipe to create Event Adapters.
 * 
 * @template I the input type of the returned stream (the event adapter)
 * @template O the output type of the returned stream (= the input type of the actual target stream)
 * @example const MyUsefulEventAdapter = inputPipe(...pipeline);
 * const template = rml`
 *   <input onkeypress="${MyUsefulEventAdapter(targetObserver)}">
 * `;
**/
export function inputPipe<I>(): (target: Target<I>) => InputObserver<I>;
export function inputPipe<I, A>(op1: OperatorFunction<I, A>): (target: Target<A>) => InputObserver<I>;
export function inputPipe<I, A, B>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>): (target: Target<B>) => InputObserver<I>;
export function inputPipe<I, A, B, C>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): (target: Target<C>) => InputObserver<I>;
export function inputPipe<I, A, B, C, D>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): (target: Target<D>) => InputObserver<I>;
export function inputPipe<I, A, B, C, D, E>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): (target: Target<E>) => InputObserver<I>;
export function inputPipe<I, A, B, C, D, E, F>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): (target: Target<F>) => InputObserver<I>;
export function inputPipe<I, A, B, C, D, E, F, G>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): (target: Target<G>) => InputObserver<I>;
export function inputPipe<I, A, B, C, D, E, F, G, H>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): (target: Target<H>) => InputObserver<I>;
export function inputPipe<I, A, B, C, D, E, F, G, H, J>(op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, J>): (target: Target<J>) => InputObserver<I>;
export function inputPipe<I, O>(...pipeline: OperatorPipeline<I, O>): (target: Target<O>) => InputObserver<I>;
export function inputPipe<I extends any, O extends any>(...pipeline: OperatorPipeline<I, O>) {
	return (target: Target<O>) =>
		pipeInFromArray<I, O>(target, pipeline as OperatorFunction<any, any>[]);
}

export const feed = pipeIn;
export const feedIn = pipeIn;

export const reversePipe = inputPipe;

// TBC
export const source = <I, O = I>(...reversePipeline: [...OperatorPipeline<I, O>, Target<O>]) => {
	const destination = reversePipeline.pop() as RMLTemplateExpressions.TargetEventHandler<O>;
	return pipeInFromArray<I, O>(destination, reversePipeline as OperatorFunction<any, any>[]);
};

export function sink<I>(source: Observable<I>): Observable<I>;
export function sink<I, A>(source: Observable<I>, op1: OperatorFunction<I, A>): Observable<A>;
export function sink<I, A, B>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>): Observable<B>;
export function sink<I, A, B, C>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
export function sink<I, A, B, C, D>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Observable<D>;
export function sink<I, A, B, C, D, E>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): Observable<E>;
export function sink<I, A, B, C, D, E, F>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): Observable<F>;
export function sink<I, A, B, C, D, E, F, G>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): Observable<G>;
export function sink<I, A, B, C, D, E, F, G, H>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): Observable<H>;
export function sink<I, A, B, C, D, E, F, G, H, J>(source: Observable<I>, op1: OperatorFunction<I, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, J>): Observable<J>;
export function sink<I, O>(source: Observable<I>, ...pipeline: OperatorPipeline<I, O>): Observable<O>;
export function sink<I, O>(source: Observable<I>, ...pipeline: OperatorPipeline<I, O>) {
	return sinkFromArray<I, O>(source, pipeline as OperatorFunction<any, any>[]);
}

export const EventAdapter = inputPipe;
