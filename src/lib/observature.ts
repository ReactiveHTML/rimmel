// @ts-nocheck

import type { Observable as Observable1, Observer } from '../types/futures';
import type { MonkeyPatchedObservable as Observable2 } from '../types/monkey-patched-observable';
import { SymbolObservature } from '../constants';

type Observable<T> = Observable1<T> | Observable2<T>;
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

export const CreateObservature = <I, O>(initial?: O) => {
	let sources: Observable<I>[] = [];
	let subscribers: Observer<O>[] = [];

	const operators = <OperatorPreload[]>[];
	const output = new Observable<O>((observer: Observer<O>) => {
		subscribers.push(observer);
		return {
			unsubscribe: () => {
				subscribers = subscribers.filter(sub => sub !== observer);
			}
		};
	});

	const applyPipeline = (source: Observable<any>) => {
		const pipeline = operators.reduce((obs, [prop, args]: OperatorPreload) => obs[prop](...args), source);
		return pipeline.subscribe({
			next: (val: O) => subscribers.forEach(sub => sub.next?.(val) ?? sub(val)),
			error: (error: unknown) => subscribers.forEach(sub => sub.error?.(error) ?? sub(error)),
			complete: () => subscribers.forEach(sub => sub.complete?.())
		});
	};

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
						return target;
					}

				case 'type':
					return undefined;

				case 'next':
					return (value: O) => applyPipeline(Observable.from([value]));

				case 'error':
					return (error: unknown) => subscribers.forEach(sub => sub.error?.(error) ?? sub(error));

				case 'complete':
					return () => subscribers.forEach(sub => sub.complete?.());

				case 'subscribe':
					return (_observer: Observer<O>) => {
						subscribers.push(_observer);
						const starter = Observable.merge(...(<Observable<I>[]>[]).concat(sources, initial ? Observable.from([].concat(initial ?? [])) : <Observable<I>[]>[]));
						const subscription = applyPipeline(starter);
						if(initial !== undefined) {
							subscribers.forEach(sub => sub.next?.(initial));
						}
						return subscription;
					}

				default:
					if(Observable.prototype.hasOwnProperty(prop)) {
						return function(...args: (keyof Observable<I>)[]) {
							// FIXME: this should return a new Observature
							// (or a separate pipeline rather than modifying the original?)
							// we still want to keep the same sources
							operators.push(<OperatorPreload>[prop, args]);
							return this;
						}
					}
					return (target as any)[prop];
			}
		}
	}) as unknown as IObservature<I, O>;
};

export class Observature<I, O>{
	constructor(initial: O) {
		return CreateObservature(initial);
	}
};

export const isObservature = <I, O>(x: any): x is IObservature<I, O> =>
	x?.Observature || x[SymbolObservature]
;
