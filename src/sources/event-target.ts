import { inputPipe } from '../utils/input-pipe';
import { map } from 'rxjs';

export const EventTarget = inputPipe<Event, Node>(
	map(e => <Node>e.target)
);

