import type { RMLTemplateExpressions } from '../types/internal';
import type { Observer } from '../types/futures';
import type { Source } from '../types/source';

import { map } from "rxjs";
import { curry } from '../utils/curry';
import { EventListenerFunction } from '../types/dom';

/**
 * An Event Source Operator that "cuts" the value of the underlying <input> element
 * and resets it to the provided value or empty otherwise
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const swap =	<E extends Event>(replacement: string | Function) =>
	map((e: E) => {
		const t = (<HTMLInputElement>e.target);
		const v = t.value;
		t.value = typeof replacement == 'function' ? replacement(v) : replacement;
		return v
	})
;

/**
 * An Event Source that "cuts" the value of the underlying <input> element
 * and resets it to the provided value or empty otherwise
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Swap =
	<T extends HTMLElement, I extends Event, S extends string | Function | undefined>
	(replacement: string | Function = '', source?: RMLTemplateExpressions.SourceExpression<I>) =>
		curry<I, string>(swap(replacement), source)
;
