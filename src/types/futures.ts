export type ObserverFunction<T> = (value: T) => unknown;

export interface Observer<I> {
    next: (value: I) => void;
    error?: (error: unknown) => void;
    complete?: () => void;
};

export type Subscription = {
    unsubscribe: () => void;
};

// A whole pass-through pipeline
export type Transformer<I, O> = Observer<I> & {
    subscribe: (observer: ObserverFunction<O>) => Subscription;
};

export type Observable<T> = {
    subscribe: (observer: ObserverFunction<T>) => Subscription;
};

export const isObservable = (x: any): x is Observable<any> =>
    !!x.subscribe;

export const isPromise = (x: any): x is Promise<any> =>
    !!x.then;

export type Subject<T> = {
    subscribe: (observer: ObserverFunction<T>) => Subscription;
    next: (value: T) => void;
    error?: (error: unknown) => void;
    complete?: () => void;
};

export type BehaviorSubject<T> = Subject<T> & {
    getValue: () => T;
    value: T;
};

export type Operator<T, R> = (source: Observable<T>) => Observable<R>;

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
