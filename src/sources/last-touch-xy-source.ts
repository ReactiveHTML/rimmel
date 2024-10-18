import type { Coords } from '../types/coords';

import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

/**
 * An Event Source emitting the "[x, y]" coordinates of the last touch
 * @returns EventSource<Coords>
*/
export const LastTouchXY = inputPipe<TouchEvent, Coords>(
	map((e: TouchEvent) => {
		const t = [...e.touches].at(-1);
		return <Coords>[t?.clientX, t?.clientY];
	})
);

