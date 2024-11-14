import type { RMLTemplateExpressions } from "../types/internal";
import { EventListenerFunction } from "../types/dom";
import type { Observer } from "../types/futures";

import { map } from 'rxjs';
import { inputPipe } from '../utils/input-pipe';
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
export const Dataset =
	<T extends HTMLElement, I extends Event, O extends string | undefined>
	(key: string, source?: RMLTemplateExpressions.SourceExpression<I | O>): Source<I, O> | Observer<I> | EventListenerFunction<I> => {
		const handler = inputPipe<I, O>(
			map((e: I) => <O>((<T>e.target).dataset[key]))
		);

		return (
			source
			? handler(source)
			: handler
		);
	}
;

