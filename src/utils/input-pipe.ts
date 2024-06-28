import type { OperatorFunction } from 'rxjs';

import { Subject } from 'rxjs';

/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 * This works the opposite of pipe(), which transforms the output of an observable,.
 * whilst this transforms the input.
**/
export const pipeIn = <I, O>(target: Observer<O>, ...pipeline: OperatorFunction[]) => {
	const source = new Subject<I>();
	source
		.pipe(...pipeline)
		.subscribe(target)
	;
	// FIXME: will we need to unsubscribe?
	return source;
};

