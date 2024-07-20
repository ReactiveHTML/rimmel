import { map } from 'rxjs';
import { pipeIn } from '../utils/input-pipe';

export const EventData = pipeIn<InputEvent, string | null>(
	map(e => e.data)
);
