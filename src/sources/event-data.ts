import { inputPipe } from '../utils/input-pipe';
import { map } from 'rxjs';

export const EventData = inputPipe<InputEvent, string | null>(
	map(e => e.data)
);
