import type { OperatorFunction } from 'rxjs';
import type { MaybeFuture, Observable, Observer } from '../types/futures';
import type { RMLTemplateExpressions } from '../types/internal';

import { Subject } from 'rxjs';

// export type OperatorPipeline<I, O, M = O> = [OperatorFunction<I, M>, ...(OperatorPipeline<M, O>[])];
export type OperatorPipeline<I, O> = [...OperatorFunction<any, any>[]];

export type Pipeline<I, O> = (i: Observable<I>) => Observable<O>;
export type rxPipe<I, O> = (...pipeline: OperatorPipeline<I, O>) => Pipeline<I, O>;

/**
 * Create an "input pipe" by prepending operators to the input of an Observer, Subject, BehaviorSubject, or plain subscriber function.
 * This works the opposite of RxJS's pipe(), which works on the output of an Observable.
**/
export const pipeIn =
	<I, O=I>(target: RMLTemplateExpressions._TargetEventHandler<O>, ...pipeline: OperatorPipeline<I, O>): Observer<I> => {
		const source = new Subject<I>();
		source
			.pipe(...(<[OperatorFunction<I, O>]>pipeline))
			.subscribe(<Observer<O>>target)
		;
		// FIXME: will we need to u1n1subscribe? Then store a reference for unsubscription
		// TODO: can we/should we delay subscription until mounted? Could miss the first events otherwise

		return source;
	};

/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 * This works the opposite of the pipe() function in RxJS, which transforms the output of an observable.
 * whilst inputPipe transforms the input.
 * @example const p = inputPipe(...pipeline);
 *   const p2 = inputPipe(targetObserver);
**/
export const inputPipe = <I, O=unknown>(...pipeline: OperatorPipeline<I, O>) =>
	(target: RMLTemplateExpressions._TargetEventHandler<O>) =>
		pipeIn(target, ...pipeline)
;


export const feed = pipeIn;
export const feedIn = pipeIn;

// WIP, TBC
export const source = (...reversePipeline: [...OperatorPipeline<any, any>, Observer<any>]) => pipeIn(<Observer<any>>reversePipeline.pop(), ...<OperatorPipeline<any, any>>reversePipeline);
export const sink = (source: MaybeFuture<any>, ...pipeline: OperatorPipeline<any, any>) => source.pipe(...pipeline);
