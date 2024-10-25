import type { RMLEventMap } from './dom';

interface Observable<T> {
  subscribe: (observer: (value: T) => void) => void;
}

declare global {
  interface Document {
    when<T>(event: keyof RMLEventMap): Observable<T>;
  }

  interface Element {
    when<T>(event: keyof RMLEventMap): Observable<T>;
  }

  interface Window {
    when<T>(event: keyof RMLEventMap): Observable<T>;
  }

}

