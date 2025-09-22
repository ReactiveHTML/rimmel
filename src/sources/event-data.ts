import { inputPipe } from '../utils/input-pipe';
import { map } from 'rxjs';

/**
 * An Event Operator that emits the value of the underlying &lt;input&gt; element
 * @returns EventSource<string>
 **/
export const eventData =
	map((e: InputEvent) => e.data);

/**
 * An Event Adapter that emits the value of the underlying &lt;input&gt; element
 * @returns EventSource<string>
 **/
export const EventData =
	inputPipe<InputEvent, string | null>(
		eventData
	)
;
