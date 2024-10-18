import type { RMLTemplateExpressions } from "../types/internal";
import { EventListenerFunction } from "../types/dom";
import type { Observer } from "../types/futures";

import { map } from 'rxjs';
import { inputPipe } from '../utils/input-pipe';
import { Source } from "../types/source";

/**
 * An Event Source emitting a numerical dataset value from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 * @example <button data-foo="123" onclick="${Numberset(stream, 'foo')}"> ... </button>
 * @example <button data-foo="123" onclick="${Numberset(handlerFn, 'foo')}"> ... </button>
 * @example <button data-foo="123" onclick="${Numberset(resolveFn, 'foo')}"> ... </button>
 * @example <button data-foo="123" onclick="${Numberset(rejectFn, 'foo')}"> ... </button>
**/
export const Numberset = <T extends HTMLElement, I extends Event, O extends number>(key: string): Source<I, O> =>
	inputPipe<I, O>(
		map((e: Event) => <O>Number((<T>e.target).dataset[key]))
	)
;

