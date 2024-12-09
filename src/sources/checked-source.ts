import { map } from "rxjs";
import { inputPipe } from '../utils/input-pipe';

/**
 * An Event Source Operator emitting the checked state of the underlying checkbox element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, boolean>
 */
export const checkedState = map((e: Event) => (<HTMLInputElement>e.target).checked);


/**
 * An Event Source emitting the checked state of the underlying checkbox element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<boolean>
 */
export const CheckedState = inputPipe<Event, string>(
  checkedState
);

