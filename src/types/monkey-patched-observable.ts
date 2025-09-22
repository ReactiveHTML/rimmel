const hasNativeObservable = typeof Observable === 'function';
export class MonkeyPatchedObservable<T> extends (hasNativeObservable ? Observable : Object)<T> {
  // static [operatorName: (string | symbol) & Exclude<string | symbol, keyof Observable>]: <R=T>(...args: any[]) => MonkeyPatchedObservable<R>;// <T, O extends MonkeyPatchedObservable<T>>() => MonkeyPatchedObservable<O>;
  static [key: string]: <R>(...args: any[]) => MonkeyPatchedObservable<R>;
  /* @ts-ignore */
  [key: string]: <R>(...args: any[]) => MonkeyPatchedObservable<R>;
}
