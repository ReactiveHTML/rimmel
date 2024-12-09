import { map } from 'rxjs';
import { inputPipe } from '../utils/input-pipe';
import { Source } from "../types/source";

/**
 * An Event Operator emitting a numerical dataset value from the underlying element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, number>
 * @example <button data-foo="123" onclick="${source(numberset('foo'), isEven, stream)}"> ... </button>
**/
export const numberset = (key: string) => map((e: Event) => Number((<HTMLElement>e.target).dataset[key]));

/**
 * An Event Source emitting a numerical dataset value from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<number>
 * @example <button data-foo="123" onclick="${Numberset('foo', stream)}"> ... </button>
 * @example <button data-foo="123" onclick="${Numberset('foo', handlerFn)}"> ... </button>
**/
export const Numberset = <T extends HTMLElement, I extends Event, O extends number>(key: string): Source<I, O> =>
	inputPipe<I, O>(
		numberset(key)
	)
;