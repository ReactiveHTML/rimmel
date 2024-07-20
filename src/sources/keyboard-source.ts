// import type { char } from '../types/basic';

import { map } from 'rxjs';
import { pipeIn } from '../utils/input-pipe';

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Key = pipeIn<KeyboardEvent, string>(
	map(e => e.key)
);
