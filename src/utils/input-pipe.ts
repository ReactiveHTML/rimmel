import type { MaybeFuture, Observer, OperatorPipeline } from '../types/futures';
import type { RMLTemplateExpressions } from '../types/internal';

import { Subject } from 'rxjs';

/**
 * Create an "input pipe" by prepending operators to the input of an Observer, Subject, BehaviorSubject, or plain subscriber function.
 * This works the opposite of RxJS's pipe(), which works on the output of an Observable.
**/
export const pipeIn =
	<I, O=I>(target: RMLTemplateExpressions.TargetEventHandler<O>, ...pipeline: OperatorPipeline<I, O>): Observer<I> => {
		const source = new Subject<I>();
		source
			.pipe(...pipeline)
			.subscribe(target)
		;

		// FIXME: will we need to unsubscribe? Then store a reference for unsubscription
		// TODO: can we/should we delay subscription until mounted? Could miss the first events otherwise
		// TODO: check if a Subject is needed, or if we can connect directly to the target (e.g. w/ Observature.addSource)

		return source;
	}
;

/**
 * Create an "input pipe" by prepending operators to an Observer or a Subject
 *
 * @remarks This works the opposite of the `pipe()` function in RxJS, which
 * transforms the output of an observable whilst this transforms the input.
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
export const inputPipe = <I extends any, O extends any>(...pipeline: OperatorPipeline<I, O>) =>
	(target: RMLTemplateExpressions.TargetEventHandler<O>) =>
		pipeIn<I, O>(target, ...pipeline)
;

export const feed = pipeIn;
export const feedIn = pipeIn;

export const reversePipe = inputPipe;

// TBC
export const source = <I, O=I>(...reversePipeline: [...OperatorPipeline<I, O>, (Observer<any> | Function)]) =>
	pipeIn(<Observer<any>>reversePipeline.pop(), ...reversePipeline);

export const sink = (source: MaybeFuture<any>, ...pipeline: OperatorPipeline<any, any>) =>
	source.pipe(...pipeline);

