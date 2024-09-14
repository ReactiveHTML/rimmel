import type { BehaviorSubject, Observable, Observer, Subject, Subscription } from 'rxjs';
export type { BehaviorSubject, Observable, Observer, OperatorFunction, Subject, Subscription } from 'rxjs';

// export type Subject<T> = {
//     subscribe: (observer: ObserverFunction<T>) => Subscription;
//     pipe: (value: T) => void;
//     next: (value: T) => void;
//     error?: (error: unknown) => void;
//     complete?: () => void;
// };

// export type BehaviorSubject<T> = Subject<T> & {
//     getValue: () => T;
//     value: T;
// };

// export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

export type ObserverFunction<T> = (value: T) => void;
export type ObserverErrorFunction = (e: Error) => void;
export type ObserverCompleteFunction = () => void;

// export interface Observer<I> {
//     next: ObserverFunction<I>;
//     error?: ObserverErrorFunction;
//     complete?: ObserverCompleteFunction;
// };

// export type Observable<T> = {
//     subscribe: (observer: Observer<T> | ObserverFunction<T>, error?: ObserverErrorFunction, complete?: ObserverCompleteFunction) => Subscription;
// };

export const isObserver = (x: any): x is Observer<any> =>
    !!x?.next;

// export type Subscription = {
// 	destination: any; // FIXME HACK: an internal RxJS property, not to be relied upon
//     unsubscribe: () => void;
// };

/**
 * An in-out stream, also known as an Observable Subject
 * that's both an Observable and an Observer
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

export type Present<T> = T;
export type Future<T> = Promise<T> | Observable<T>;
export type MaybeFuture<T> = Present<T> | Future<T>;
