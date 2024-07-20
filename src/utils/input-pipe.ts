import type { OperatorFunction } from 'rxjs';
import type { RMLTemplateExpressions } from '../types/internal';
import type { Observer, Stream } from '../types/futures';

import { Subject } from 'rxjs';

export type OperatorPipeline<I, O, N = O> = [OperatorFunction<I, N>, ...(OperatorFunction<N, O>[])];

/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 * This works the opposite of pipe(), which transforms the output of an observable,.
 * whilst this transforms the input.
**/
export const pipeIn = <I, O=I>(...pipeline: OperatorPipeline<I, O>) =>
	(target: RMLTemplateExpressions.SourceExpression<O>): Observer<I> => {
		const source = new Subject<I>();
		source
			.pipe(...pipeline)
			.subscribe(target)
		;
		// FIXME: will we need to unsubscribe?

		return source;
	}
;
