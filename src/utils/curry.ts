import { Observer, OperatorPipeline } from '../types';
import type { RMLTemplateExpressions } from '../types/internal';
import type { Observable, OperatorFunction, UnaryFunction } from 'rxjs';

import { isFuture } from '../types/futures';
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
export function korma<I, O = I>(
  pipeline: OperatorFunction<I, O>[]
): (destination: RMLTemplateExpressions.SourceExpression<O>) => Observer<I>;

export function korma<I, O = I>(
  pipeline: OperatorFunction<I, O>[],
  destination: RMLTemplateExpressions.SourceExpression<O>
): Observer<I>;

export function korma<I, O = I>(
  pipeline: OperatorFunction<I, O>[],
  destination?: RMLTemplateExpressions.SourceExpression<O>
) {
  return destination === undefined
    ? inputPipe<I, O>(...pipeline)
    : pipeIn<I, O>(destination, ...pipeline);
}