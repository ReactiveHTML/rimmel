import { map } from "rxjs";
import { inputPipe } from '../utils/input-pipe';
import { autoValue } from "../utils/auto-value";

/**
 * An Event Source Operator emitting the value of the underlying <input> element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, string>
 */
export const value = map((e: Event) => autoValue((<HTMLInputElement>e.target)));

/**
 * An Event Adapter emitting the value of the underlying <input> element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Value = inputPipe<Event, string>(
	value
);

/**
 * An Event Source Operator emitting the value of the underlying <input> element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, string>
 */
export const valueAsString = map((e: Event) => (<HTMLInputElement>e.target).value);

/**
 * An Event Adapter emitting the value of the underlying <input> element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const ValueAsString = inputPipe<Event, string>(
	valueAsString
);

/**
 * An Event Source Operator for valueAsNumber
 * @description Emits the numeric value of the underlying <input type="number"> or <input type="range"> instead of a regular DOM Event object
 * @returns OperatorFunction<Event, number | null>
 */
export const valueAsNumber = map((e: Event) => (<HTMLInputElement>e.target).valueAsNumber);

/**
 * An Event Source for valueAsNumber
 * @description Emits the numeric value of the underlying <input type="number"> or <input type="range"> instead of a regular DOM Event object
 * @returns EventSource<number>
 */
export const ValueAsNumber = inputPipe<Event, number>(
	valueAsNumber
);

/**
 * An Event Source Operator for valueAsDate
 * @description Emits the numeric value of the underlying `<input type="date">` instead of a regular DOM Event object
 * @returns OperatorFunction<Event, Date | null>
 */
export const valueAsDate = map((e: Event) => (<HTMLInputElement>e.target).valueAsDate);

/**
 * An Event Adapter for valueAsDate
 * @description Emits the numeric value of the underlying `<input type="date">` instead of a regular DOM Event object
 * @returns EventSource<Date | null>
 */
export const ValueAsDate = inputPipe<Event, Date | null>(
	valueAsDate
);
