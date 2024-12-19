import type { Observer } from '../types/futures';

import { MonkeyPatchedObservable as Observable } from '../types/monkey-patched-observable';
import { SymbolObservature } from '../constants';

type OperatorPreload = [string, unknown[]];

export interface IObservature<I, O=I> {
	value: O;
	Observature: true;
	[SymbolObservature]: true;
	addSource: (source: Observable<I>) => void;
	next: (value: O) => void;
	error: (error: unknown) => void;
	complete: () => void;
	subscribe: (observer: Observer<O>) => void;
}
/**
 * A Future Subject meant to connect an operator pipeline
 * to an Observable that doesn't exist yet
 * and an Observer that also doesn't exist yet
 * without creating an intermediary Subject (so it'll save an unnecessary step in the pipeline)
 **/
export const CreateObservature = <I, O>(initial?: O) => {
	let sources: Observable<I>[] = [];

	let observer = <Observer<O>>{
		next: () => {},
		error: () => {},
		complete: () => {},
	};
	const operators = <OperatorPreload[]>[];
	const output = new Observable<O>((_observer: Observer<O>) => {
		observer = _observer;
		return {
			unsubscribe: () => {}
		};
	});
	return new Proxy(output, {
		get(target, prop) {
			switch(prop) {

				case 'value':
					return initial;

				case Symbol.for('observable'):
				case '@@observable':
					return function() { return this };

				case '@@Observature':
				case 'Observature':
				case SymbolObservature:
					return true;

				case 'addSource':
					return (_source: Observable<I>) => {
						sources.push(_source);
					}

				case 'type':
					return undefined;

				case 'next':
					return observer.next;

				case 'error':
					return observer.error;

				case 'complete':
					return observer.complete;

				case 'subscribe':
					return (_observer: Observer<O>) => {
						observer = _observer;
						/* @ts-ignore */
						const starter = Observable.merge(...(<Observable<I>[]>[]).concat(sources, initial ? Observable.of(initial) : <Observable<I>[]>[]));
						const pipeline = operators
							.reduce((obs, [prop, args]: OperatorPreload) => obs[prop](...args), starter)
						/* @ts-ignore */
						const subscription = pipeline.subscribe(observer);
						if(initial !== undefined) {
							observer.next(initial);
						}
						return subscription;
					}

				default:
					if(Observable.prototype.hasOwnProperty(prop)) {
						// Any Observable method
						return function(...args: (keyof Observable<I>)[]) {
							operators.push(<OperatorPreload>[prop, args]);
							return this;
						}
					} else {
						// Anything left to handle?
						return (target as any)[prop];
					}
			};
		}
	}) as unknown as IObservature<I, O>;
};

export class Observature<I, O>{
	constructor(initial: O) {
		return CreateObservature(initial);
	}
}

export const isObservature = <I, O>(x: any): x is IObservature<I, O> =>
	x?.Observature || x[SymbolObservature]
;
