// import type { char } from '../types/basic';
import { map } from 'rxjs';
import { inputPipe } from '../utils/input-pipe';

/**
 * An Event Operator emitting event.key instead of any KeyboardEvent object
 * @returns OperatorFunction<KeyboardEvent, string>
 *
 * For one-step input pipelines, see the {@link Key | Key (uppercase)} Event Adapter
 *
 * ## Examples
 *
 * ### Collect distinct vowels typed in a text box
 *
 * The following illustrates how to get any key presses from the text box
 * and only pass the actual character through to the main stream
 *
 * ```ts
 * import { Subject, distinct, filter, scan } from 'rxjs';
 * import { rml, source, key } from 'rimmel';
 *
 * const isVowel = filter(c => 'aeiou'.includes(c));
 *
 * const Component = () => {
 *   const vowels = new Subject<string>().pipe(
 *   distinct(),
 *   scan((a, b) => a.concat(b)),
 * );
 *
 *   return rml`
 *     Unique vowels pressed: "<span>${vowels}"</span>"
 *
 *     <input onkeypress="${source(key, isVowel, vowels)}>
 *   `;
 * }
 * ```
 */
export const key = map((e: KeyboardEvent) => e.key);

/**
 * An Event Adapter emitting event.key instead of any KeyboardEvent object
 * @returns EventSource<string>
 *
 * For multi-step input pipelines, see {@link key | key (lowercase)}
 *
 * ## Examples
 *
 * ### Display the last key pressed in a text box
 *
 * The following illustrates how to get any key presses from the text box
 * and only pass the actual character through to the main stream
 *
 * ```ts
 * import { Subject } from 'rxjs';
 * import { rml, Key } from 'rimmel';
 *
 * const Component = () => {
 *   const stream = new Subject<string>();
 *
 *   return rml`
 *     Last character pressed: "<span>${stream}"</span>"
 *
 *     <input onkeypress="${Key(stream)}>
 *   `;
 * }
 * ```
 *
 * ### Collect distinct characters typed in a text box
 *
 * The following illustrates how to get any key presses from the text box
 * and only pass the actual character through to the main stream
 *
 * ```ts
 * import { Subject, distinct, scan } from 'rxjs';
 * import { rml, Key } from 'rimmel';
 *
 * const Component = () => {
 *   const stream = new Subject<string>().pipe(
 *   distinct(),
 *   scan((a, b) => a.concat(b)),
 * );
 *
 *   return rml`
 *     Unique characters pressed: "<span>${stream}"</span>"
 *
 *     <input onkeypress="${Key(stream)}>
 *   `;
 * }
 * ```
 */
export const Key = inputPipe<KeyboardEvent, string>(
	key
);

export const asKey = key;
export const AsKey = Key;
