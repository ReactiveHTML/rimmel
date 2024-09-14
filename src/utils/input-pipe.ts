import type { OperatorFunction } from 'rxjs';
import type { RMLTemplateExpressions } from '../types/internal';
import type { Observable, Observer } from '../types/futures';

import { Subject } from 'rxjs';

export type OperatorPipeline<I, O, N = O> = [OperatorFunction<I, N>, ...(OperatorFunction<N, O>[])];
type rxPipe<I, O> = (...pipeline: OperatorPipeline<I, O>) => (input: Observable<I>) => Observable<O>;

/**
 * Create an "input pipe" by prepending operators to the input of an Observer or a Subject
 * This works the opposite of RxJS's pipe(), which works on the output of an Observable.
**/
export const reversePipe =
	<I, O=I>(target: RMLTemplateExpressions.SourceExpression<O>, ...pipeline: OperatorPipeline<I, O>): Observer<I> => {
		const source = new Subject<I>();
		source
			.pipe(...(<[OperatorFunction<I, O>]>pipeline))
			.subscribe(target)
		;
		// FIXME: will we need to unsubscribe?
		// TODO: can we/should we delay subscription until mounted? Could miss the first events otherwise

		return source;
	};

/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 * This works the opposite of the pipe() function in RxJS, which transforms the output of an observable.
 * whilst pipeIn transforms the input.
 * @example const p = pipeIn(...pipeline);
 *   const p2 = pipeIn(targetObserver);
**/
export const pipeIn = <I, O=I>(...pipeline: OperatorPipeline<I, O>) =>
	(target: RMLTemplateExpressions.SourceExpression<O>) =>
		reversePipe(target, ...pipeline)
;


/*
const reverse = <I, O>(pipe: rxPipe<I, O>, target: Observer<O>) => {
	const s = new Subject<I>();
	pipe(s).subscribe(target);
	return s;
};
*/
