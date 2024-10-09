// import type { char } from '../types/basic';
import { map } from 'rxjs';
import { inputPipe } from '../utils/input-pipe';

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Key = inputPipe<KeyboardEvent, string>(
	map((e: KeyboardEvent) => e.key)
);
