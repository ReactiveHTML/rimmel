import { map } from "rxjs";
import { inputPipe } from '../utils/input-pipe';
import { autoValue } from "../utils/auto-value";

/**
 * An Event Operator that emits the value of the underlying &lt;input&gt; element into a target observer
 *
 * @category Event Adapter Operators
 * @returns OperatorFunction<Event, string | number | date | null>
 *
 * For simple, one-step input pipelines, see the {@link Cut | Cut (uppercase)} Event Adapter
 *
 * ## Examples
 *
 * ### ValidInfo
 *
 * Create a custom Event Operator that feeds a stream with validated data, once a custom validator passes
 *
 * ```ts
 * import { Subject, filter } from 'rxjs';
 * import { rml, inputPipe, value } from 'rimmel';
 *
 * const isValid = filter((s: string) => IS_VALID_IMPL(s) );
 * const ValidInfo = inputPipe(value, isValid);
 *
 * const Component = () => {
 *   const stream = new Subject<string>();
 *
 *   return rml`
 *     <input type="text" onchange="${ValidInfo(stream)}" autofocus>
 *     [ <span>${stream}</span> ]
 *   `;
 * };
 * ```
 */
export const value = map((e: Event) => autoValue((<HTMLInputElement>e.target)));

/**
 * An Event Adapter emitting the value of the underlying &lt;input> element instead of a regular DOM Event object
 *
 * ## Example
 * Copy the value of a text box on change
 *
 * ```ts
 * import { Subject } from 'rxjs';
 * import { rml, Value } from 'rimmel';
 *
 * const Component = () => {
 *   const stream = new Subject<string>();
 *
 *   return rml`
 *     <input type="text" onchange="${Value(stream)}" autofocus>
 *     [ <span>${stream}</span> ]
 *   `;
 * };
 * ```
 */
export const Value = inputPipe<Event, string>(
	value
);

/**
 * An Event Source Operator emitting the value of the underlying &lt;input> element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, string>
 */
export const valueAsString = map((e: Event) => (<HTMLInputElement>e.target).value);

/**
 * An Event Adapter emitting the value of the underlying &lt;input> element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const ValueAsString = inputPipe<Event, string>(
	valueAsString
);

/**
 * An Event Source Operator for valueAsNumber
 * Emits the numeric value of the underlying &lt;input type="number"> or &lt;input type="range"> instead of a regular DOM Event object
 * @returns OperatorFunction<Event, number | null>
 */
export const valueAsNumber = map((e: Event) => (<HTMLInputElement>e.target).valueAsNumber);

/**
 * An Event Source for valueAsNumber
 * Emits the numeric value of the underlying &lt;input type="number"> or &lt;input type="range"> instead of a regular DOM Event object
 * @returns EventSource<number>
 */
export const ValueAsNumber = inputPipe<Event, number>(
	valueAsNumber
);

/**
 * An Event Source Operator for valueAsDate
 * Emits the numeric value of the underlying `<input type="date">` instead of a regular DOM Event object
 * @returns OperatorFunction<Event, Date | null>
 */
export const valueAsDate = map((e: Event) => (<HTMLInputElement>e.target).valueAsDate);

/**
 * An Event Adapter for valueAsDate
 * Emits the numeric value of the underlying `<input type="date">` instead of a regular DOM Event object
 * @returns EventSource<Date | null>
 */
export const ValueAsDate = inputPipe<Event, Date | null>(
	valueAsDate
);

export const asValue = value;
export const AsValue = Value;
export const asStringValue = valueAsString;
export const AsStringValue = ValueAsString;
export const asNumericValue = valueAsNumber;
export const AsNumericValue = ValueAsNumber;
export const asDateValue = valueAsDate;
export const AsDateValue = ValueAsDate;
