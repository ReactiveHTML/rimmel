// import type { char } from '../types/basic';
import { map } from 'rxjs';
import { inputPipe } from '../utils/input-pipe';

/**
 * An Event Operator emitting event.key instead of any KeyboardEvent object
 * @returns OperatorFunction<KeyboardEvent, string>
 */
export const key = map((e: KeyboardEvent) => e.key);

/**
 * An Event Adapter emitting event.key instead of any KeyboardEvent object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Key = inputPipe<KeyboardEvent, string>(
	key
);
