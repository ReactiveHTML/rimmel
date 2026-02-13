import type { RMLTemplateExpressions } from '../types/internal';

import { map } from "rxjs";
import { korma } from '../utils/curry';

type StringFunction = (s: string) => string;
type Replacement = string | StringFunction;

/**
 * An Event Operator that swaps the value of the underlying <input> element
 * with the provided replacement (or empty string by default) and emits the previous value.
 * This operator mutates the element's value as a side effect.
 * @param replacement A string or function used to compute the new value
 * @returns OperatorFunction<Event, string>
 */
export const swap =	<E extends Event>(replacement: Replacement = '') =>
	map((e: E) => {
		const t = (<HTMLInputElement>e.target);
		const v = t.value;
		t.value = typeof replacement == 'function' ? replacement(v) : replacement;
		return v
	})
;

/**
 * An Event Adapter that swaps the value of the underlying &lt;input&gt; element
 * with the provided replacement (or empty string by default) and emits the previous value to the given target.
 * @param replacement A new value or function to compute the element's next value
 * @param source A handler function or observer to send emitted values to
 * @returns EventSource<string>
 */
export const Swap =
	<I extends Event>
	(replacement?: Replacement, source?: RMLTemplateExpressions.SourceExpression<string>) =>
		korma<I, string>([swap<I>(replacement)], source)
;
