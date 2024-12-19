import type { Observer } from './futures';
import type { RMLEventMap } from './dom';

type SubscriberFunction<T> = (e: T) => void;

declare global {
  class Observable<T> {
    constructor(subscriber: (o: Observer<T>) => void);
    subscribe: (observer: SubscriberFunction<T> | Observer<T>) => void;
  }

  export interface ObservableEventListenerOptions extends AddEventListenerOptions {
  }

  interface Document {
    when<T extends Event>(event: keyof RMLEventMap, options?: ObservableEventListenerOptions): Observable<T>;
  }

  interface Element {
    when<T extends Event>(event: keyof RMLEventMap, options?: ObservableEventListenerOptions): Observable<T>;
  }

  interface Window {
    when<T extends Event>(event: keyof RMLEventMap, options?: ObservableEventListenerOptions): Observable<T>;
  }
}
