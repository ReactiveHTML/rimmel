import type { RMLTemplateExpressions } from "../types/internal";

import { map } from 'rxjs';
import { pipeIn } from '../utils/input-pipe';
import { Source } from "../types/source";

/**
 * An Event Source emitting any dataset value from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 * @example <button data-foo="bar" onclick="${Dataset(stream, 'foo')}"> ... </button>
 * @example <button data-foo="bar" onclick="${Dataset(handlerFn, 'foo')}"> ... </button>
 * @example <button data-foo="bar" onclick="${Dataset(resolveFn, 'foo')}"> ... </button>
 * @example <button data-foo="bar" onclick="${Dataset(rejectFn, 'foo')}"> ... </button>
**/
export const Dataset = <T extends HTMLElement, I extends Event, O extends RMLTemplateExpressions.SourceExpression<string | undefined>>(key: string): Source<I, O> =>
	pipeIn<I, O>(
		map((e: I) => (<T>e.target).dataset[key])
	)
;

/**
 * An Event Source emitting a numerical dataset value from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 * @example <button data-foo="123" onclick="${Numberset(stream, 'foo')}"> ... </button>
 * @example <button data-foo="123" onclick="${Numberset(handlerFn, 'foo')}"> ... </button>
 * @example <button data-foo="123" onclick="${Numberset(resolveFn, 'foo')}"> ... </button>
 * @example <button data-foo="123" onclick="${Numberset(rejectFn, 'foo')}"> ... </button>
**/
export const Numberset = <T extends HTMLElement, I extends Event, O extends RMLTemplateExpressions.SourceExpression<number>>(key: string): Source<I, O> =>
	pipeIn<I, O>(
		map((e: Event) => Number((<T>e.target).dataset[key]))
	)
;
