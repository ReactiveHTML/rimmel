import { map } from "rxjs";
import { autoValue } from '../utils/auto-value';
import { inputPipe } from '../utils/input-pipe';

/**
 * An Event Operator that "cuts" and emits the value of the underlying &lt;input&gt; element into a target observer
 *
 * This operator has side effects, as it will directly modify the underlying element
 * @category Event Adapter Operators
 * @template T the type of the target element
 * @template I the type of Event sourced from the underlying element
 * @template O the data type emitted into the target stream
 * @returns OperatorFunction<Event, string>
 *
 * For simple, one-step input pipelines, see the {@link Cut | Cut (uppercase)} Event Adapter
 *
 * ## Examples
 *
 * ### UpperCut
 *
 * Create a custom Event Operator that feeds a stream with the uppercase content of a textbox, when hitting Enter on it
 *
 * ```ts
 * import { Subject,  filter, map } from 'rxjs';
 * import { rml, inputPipe, cut } from 'rimmel';
 *
 * const onEnter = filter((e: KeyboardEvent) => e.key == 'Enter');
 * const toUpperCase = map((s: string) => s.toUpperCase());
 * const UpperCut = inputPipe(onEnter, cut, toUpperCase);
 *
 * const Component = () => {
 *   const stream = new Subject<string>();
 *
 *   return rml`
 *     <input type="text" onkeypress="${UpperCut(stream)}" autofocus>
 *     [ <span>${stream}</span> ]
 *   `;
 * };
 * ```
 */
export const cut =
  map(<T extends (HTMLInputElement | HTMLElement), I extends Event, O extends string | number | Date | null>(e: I): O => {
    const t = (<T>e.target);
    const v = <O>autoValue(t);
    (t as HTMLInputElement).value = '';
    // TODO: t.innerText = '' for contenteditable items?
    return v
  })
;

/**
 * An Event Adapter that "cuts" and emits the value of the underlying &lt;input&gt; element into a target observer
 *
 * @category Event Adapter Functions
 * @param target A handler function or Observer to feed events into
 * @returns EventSource<string>
 *
 * For advanced, multi-step input pipelines, see the {@link cut | cut (lowercase)} Operator
 *
 * ## Examples
 *
 * ### Feed a List
 *
 * Feed an [observable list](https://github.com/reactivehtml/observable-types
 ) with the uppercase content of a textbox, when hitting Enter on it
 *
 * ```ts
 * import { Collection } from 'observable-types';
 * import { Subject,  filter, map } from 'rxjs';
 * import { rml, Cut } from 'rimmel';
 *
 * const Component = () => {
 *   const list = Collection(['item1', 'item2', 'item3']);
 *
 *   return rml`
 *     <ul>${list}</ul>
 *     Add new: <input type="text" onkeypress="${Cut(stream.push)}" autofocus>
 *   `;
 * };
 * ```
 */
export const Cut =
  inputPipe<Event, string | number | Date | null>(
    cut
  )
;
