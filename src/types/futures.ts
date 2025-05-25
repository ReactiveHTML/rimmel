// import type { BehaviorSubject, Observable, Observer, Subject, Subscription } from 'rxjs';
// export type { BehaviorSubject, Observable, Observer, OperatorFunction, Subject, Subscription } from 'rxjs';

import { SymbolObservature } from "../constants";

export type Subject<T> = {
	subscribe: (observer: ObserverFunction<T>) => Subscription;
	pipe: (value: T) => void;
	next: (value: T) => void;
	error?: (error: unknown) => void;
	complete?: () => void;
};

export type BehaviorSubject<T> = Subject<T> & {
	getValue: () => T;
	value: T;
};


// export type OperatorPipeline<I, O> = 
//   [] |
//   [OperatorFunction<I, infer M>, ...OperatorPipeline<M, O>] |
//   [OperatorFunction<I, O>]
// ;
// export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;
// export type OperatorPipeline<I, O, N = O> = [OperatorFunction<I, N>, ...(OperatorPipeline<N, O>[])];
// export type OperatorPipeline<T> = T extends [infer FIRST, ...infer REST] ? [FIRST, ...OperatorPipeline<REST>] : [];
// export type OperatorPipeline<I, M, O> = I extends [infer FIRST, ...infer REST] ? [OperatorFunction<I, N>, ...OperatorPipeline<N, REST>] : [];
// export type OperatorPipeline<I, O> = I extends OperatorFunction<I, infer M> && O extends [...infer REST] ? [OperatorFunction<I, M>, ...OperatorPipeline<M, REST>] : [];

// export type OperatorPipeline<I, M, O> = I extends [infer FIRST, ...infer REST]
//   ? [OperatorFunction<FIRST, M>, ...OperatorPipeline<REST, M, O>]
//   : [];

////////////////////////////////////////////////////////
// import { map, type OperatorFunction } from 'rxjs';
// export type OperatorPipeline<I, O=I> =
//   I extends OperatorFunction<I, infer M>
//     ? [OperatorFunction<I, M>, ...OperatorPipeline<M, O>]
//     : [OperatorFunction<I, O>];


// const p: OperatorPipeline<Event, number> = [
//     map((e: Event)=>(<HTMLInputElement>e.target).value),
//     map((s: string)=>s.toUpperCase()),
//     map((s: string)=>s.length),
// ];



// type OperatorPipeline<I, O=I> =
//   [] |
//   [OperatorFunction<I, O>] |
//   [I, O] extends [infer FIRST, ...infer REST] 
//     ? FIRST extends OperatorFunction<I, infer M>
//       ? REST extends OperatorFunction<M, O>
//         ? [OperatorFunction<I, M>, ...OperatorPipeline<M, O>]
//         : never
//       : never
//     : never

//////////////////////////// 
// import { map, type OperatorFunction } from 'rxjs';
// 
// // GPT 4o1
// type OperatorPipeline<I, O = I> =
//   [] |
//   [OperatorFunction<I, O>] |
//   (
//     // Introduce a temporary tuple type T to match against
//     // rather than trying to match <I, O> directly
//     (<T extends OperatorFunction<any, any>[]>() => T extends [OperatorFunction<I, infer M>, ...infer REST]
//       ? REST extends OperatorFunction<M, O>[]
//         ? [OperatorFunction<I, M>, ...OperatorPipeline<M, O>]
//         : never
//       : never
//     ) extends infer R ? R : never
//   );
// 
// 
// 
// 
// const p: OperatorPipeline<Event, number> = [
//     map((e: Event)=>(<HTMLInputElement>e.target).value),
//     map((s: string)=>s.toUpperCase()),
//     map((s: string)=>s.length),
// ];
// 
// const x = new Subject().pipe(...p).subscribe(console.log);
////////////////////////////////////////////////////////

export type ObserverFunction<T> = (value: T) => void;
export type ObserverErrorFunction = (e: unknown) => void;
export type ObserverCompleteFunction = () => void;

export interface Observer<I> {
	next: ObserverFunction<I>;
	error?: ObserverErrorFunction;
	complete?: ObserverCompleteFunction;
};

export interface Observature<I, O=I> {
	[SymbolObservature]: any,
	addSource: <I>(source: Observable<I>) => void,
}

export type Subscription = {
	unsubscribe: () => void;
};

export type Observable<T> = {
	subscribe: (observer: Observer<T> | ObserverFunction<T>, error?: ObserverErrorFunction, complete?: ObserverCompleteFunction) =>
		Subscription;
};

export const isObserver = (x: any): x is Observer<any> =>
	!!x?.next;

// export type Subscription = {
// 	destination: any; // FIXME HACK: an internal RxJS property, not to be relied upon
//     unsubscribe: () => void;
// };

/**
 * An in-out stream, also known as an Observable Subject
 * that's both an Observable and an Observer
 * @template I the input type
 * @template O the output type
 */
export type Stream<I, O=I> = Observer<I> & Observable<O>;
// export interface Stream<I, O=I> extends Observable<I>, Observer<O> {};

// A whole pass-through pipeline
export type Transformer<I, O> = Observer<I> & {
    subscribe: (observer: ObserverFunction<O>) => Subscription;
};

export const isObservable = (x: any): x is Observable<any> =>
	!!x?.subscribe;

export const isPromise = (x: any): x is Promise<any> =>
	!!x?.then;

export type MaybePromise<T> = Partial<Promise<T>>;
export type MaybeObserver<I> = Partial<Observer<I>>;
export type MaybeSubscription = Partial<Subscription>;
export type MaybeObservable<T> = Partial<Observable<T>>;
export type MaybeSubject<T> = Partial<Subject<T>>;
export type MaybeBehaviorSubject<T> = Partial<BehaviorSubject<T>>;
export type MaybeTransformer<I, O> = Partial<Transformer<I, O>>;

/**
 * Any type that's not a Future (e.g.: not a Promise, not an Observable)
 **/
export type Present<T> = T;
export type Future<T> = Promise<T> | Observable<T>;
export type MaybeFuture<T> = Present<T> | Future<T>;
