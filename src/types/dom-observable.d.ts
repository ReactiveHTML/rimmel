import type { RMLEventMap } from './dom';

interface Observable<T> {
  subscribe: (observer: (e: T) => void) => void;
}

declare global {
  interface Document {
    when<T extends Event>(event: keyof RMLEventMap): Observable<T>;
  }

  interface Element {
    when<T extends Event>(event: keyof RMLEventMap): Observable<T>;
  }

  interface Window {
    when<T extends Event>(event: keyof RMLEventMap): Observable<T>;
  }

}

