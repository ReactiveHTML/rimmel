import { map } from "rxjs";
import { inputPipe } from '../utils/input-pipe';

/**
 * An Event Source emitting the value of the underlying <input> element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Value = inputPipe<Event, string>(
	map(e => (<HTMLInputElement>e.target).value)
);

/**
 * An Event Source for valueAsNumber
 * @description Emits the numeric value of the underlying <input type="number"> or <input type="range"> instead of a regular DOM Event object
 * @returns EventSource<string>
 */
export const ValueAsNumber = inputPipe<Event, number>(
	map(e => (<HTMLInputElement>e.target).valueAsNumber)
);

/**
 * An Event Source for valueAsDate
 * @description Emits the numeric value of the underlying `<input type="date">` instead of a regular DOM Event object
 * @returns EventSource<string>
 */
export const ValueAsDate = inputPipe<Event, Date | null>(
	map(e => (<HTMLInputElement>e.target).valueAsDate)
);
