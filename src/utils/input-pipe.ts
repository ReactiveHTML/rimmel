import type { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import type { MaybeFuture, Observable, Observer } from '../types/futures';
import type { RMLTemplateExpressions } from '../types/internal';

import { Subject } from 'rxjs';

// export type OperatorPipeline<I, O, M = O> = [OperatorFunction<I, M>, ...(OperatorPipeline<M, O>[])];
export type OperatorPipeline<I, O> = [...(MonoTypeOperatorFunction<I> | OperatorFunction<any, any>)[]];

export type Pipeline<I, O> = (i: Observable<I>) => Observable<O>;
export type rxPipe<I, O> = (...pipeline: OperatorPipeline<I, O>) => Pipeline<I, O>;

/**
 * Create an "input pipe" by prepending operators to the input of an Observer, Subject, BehaviorSubject, or plain subscriber function.
 * This works the opposite of RxJS's pipe(), which works on the output of an Observable.
**/
export const pipeIn =
	<I, O=I>(target: RMLTemplateExpressions.TargetEventHandler<O>, ...pipeline: OperatorPipeline<I, O>): Observer<I> => {
		const source = new Subject<I>();
		source
			.pipe(...(<[OperatorFunction<I, O>]>pipeline))
			.subscribe(<Observer<O>>target)
		;

		// FIXME: will we need to unsubscribe? Then store a reference for unsubscription
		// TODO: can we/should we delay subscription until mounted? Could miss the first events otherwise

		return source;
	}
;

/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 *
 * @remarks This works the opposite way to the pipe() function in RxJS, which
 * transforms the output of an observable whilst this transforms the input.
 * You normally use an input pipe to create Event Adapters.
 * @template I the input type of the returned stream (the event adapter)
 * @template O the output type of the returned stream (= the input type of the actual target stream)
 * @example const MyUsefulEventAdapter = inputPipe(...pipeline);
 * const template = rml`
 *   <input onkeypress="${MyUsefulEventAdapter(targetObserver)}">
 * `;
**/
export const inputPipe = <I extends any, O extends any>(...pipeline: OperatorPipeline<I, O>) =>
	(target: RMLTemplateExpressions.TargetEventHandler<O>) =>
		pipeIn<I, O>(target, ...pipeline)
;

export const feed = pipeIn;
export const feedIn = pipeIn;

export const reversePipe = inputPipe;

// TBC
export const source = (...reversePipeline: [...OperatorPipeline<any, any>, (Observer<any> | Function)]) =>
	pipeIn(<Observer<any>>reversePipeline.pop(), ...<OperatorPipeline<any, any>>reversePipeline);

export const sink = (source: MaybeFuture<any>, ...pipeline: OperatorPipeline<any, any>) =>
	source.pipe(...pipeline);

