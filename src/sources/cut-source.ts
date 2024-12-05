import type { RMLTemplateExpressions } from '../types/internal';
import type { Observer } from '../types/futures';
import type { Source } from '../types/source';

import { map } from "rxjs";
import { inputPipe } from '../utils/input-pipe';
import { autoValue } from '../utils/auto-value';

/**
 * An Event Source that "cuts" the value of the underlying <input> element
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Cut =
	<T extends HTMLElement, I extends Event, O extends string | number | date>
	(source?: RMLTemplateExpressions.SourceExpression<I>): Source<I> | Observer<I> | EventListenerFunction<I> => {
		const handler = inputPipe<I, O>(
			map((e: I) => {
				const t = (<HTMLInputElement>e.target);
				const v = <O>autoValue(t);
				t.value = '';
				return v
			})
		);

		return (
			source
			? handler(source)
			: handler
		);
	}
;

