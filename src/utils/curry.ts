import { Observer, OperatorPipeline } from '../types';
import type { RMLTemplateExpressions } from '../types/internal';
import type { Observable, OperatorFunction, UnaryFunction } from 'rxjs';

import { isFuture, isObserver } from '../types/futures';
import { inputPipe, pipeIn } from '../utils/input-pipe';
import { pipe } from 'rxjs';

/**
 * Currying "out" for observable streams
 * Create a curried observable stream from a given source
 * by applying the specified pipeline to it
 */
export const curryOut = <I, O>(...args: OperatorFunction<I, O>[] | [...OperatorFunction<any, any>[], Observable<O>]) => {
	const source = isFuture(args.at(-1)) ? args.pop() as Observable<O> : undefined;
	const stream = pipe(
		...(args as UnaryFunction<any, any>[]),
	);

	return source ? stream(source) : stream;
};

/**
 * Currying for input stream operators
 * Create a curried observer stream from a given target
 * by applying the specified input pipeline to it
 **/
export const korma = <I, O=I>(pipeline: OperatorFunction<I, O>[], destination?: RMLTemplateExpressions.SourceExpression<O>) =>
	// we're collecting pipeline as an array instead of regular parameters because it would be hard
	// to tell a destination that's a plain function from another operator, which is also a function.
	destination
		? pipeIn<I, O>(destination, ...pipeline)
		: inputPipe(...pipeline)
;
