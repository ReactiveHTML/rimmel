import type { RMLTemplateExpressions } from '../types/internal';
import type { OperatorFunction } from 'rxjs';

import { inputPipe, pipeIn } from '../utils/input-pipe';

/**
 * Currying "out" for observable streams
 * Create a curried observable stream from a given source
 * by applying the specified pipeline to it
 */
export const curryOut = <I, O>(...args: OperatorFunction<I, O>[] | [...OperatorFunction<any, any>, Observable<O>]) => {
	const source = args.at(-1)?.subscribe ? args.pop(): undefined;
	const stream = pipe(
		...args,
	);

	return source ? stream(source) : stream;
};


/**
 * Currying "in" for input stream operators
 * Create a curried observer stream from a given target
 * by applying the specified input pipeline to it
 **/
export const curry =
	<I, O>
	(op: OperatorFunction<I, O>, destination?: RMLTemplateExpressions.Any) =>
		destination
			? pipeIn<I, O>(destination, op)
			: inputPipe<I, O>(op)
;
