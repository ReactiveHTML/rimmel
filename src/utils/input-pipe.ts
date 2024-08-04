import type { OperatorFunction } from 'rxjs';
import type { RMLTemplateExpressions } from '../types/internal';
import type { Observer } from '../types/futures';

import { Subject } from 'rxjs';

export type OperatorPipeline<I, O, N = O> = [OperatorFunction<I, N>, ...(OperatorFunction<N, O>[])];


/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 * This works the opposite of pipe(), which transforms the output of an observable,.
 * whilst this transforms the input.
**/
export const pipeIn = <I, O=I>(target: RMLTemplateExpressions.SourceExpression<O>, ...pipeline: OperatorPipeline<I, O>): Observer<I> => {
	const source = new Subject<I>();
	source
		.pipe(...(<[OperatorFunction<I, O>]>pipeline))
		.subscribe(target)
	;
	// FIXME: will we need to unsubscribe?
	// TODO: can we only subscribe on mount? Shall we?

	return source;
};

/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 * This works the opposite of pipe(), which transforms the output of an observable,.
 * whilst this transforms the input.
**/
export const prepipe = <I, O=I>(...pipeline: OperatorPipeline<I, O>) =>
	(target: RMLTemplateExpressions.SourceExpression<O>): Observer<I> =>
		pipeIn(target, ...pipeline)
;
