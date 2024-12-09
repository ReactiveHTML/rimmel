import type { Coords } from '../types/coords';

import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

/**
 * An Event Operator emitting the "[x, y]" coordinates of the last touch event
 * @returns OperatorFunction<TouchEvent, Coords>
*/
export const lastTouchXY =
	map((e: TouchEvent) => {
		const t = [...e.touches].at(-1);
		return <Coords>[t?.clientX, t?.clientY];
	})
;

/**
 * An Event Source emitting the "[x, y]" coordinates of the last touch event
 * @returns EventSource<Coords>
*/
export const LastTouchXY = inputPipe<TouchEvent, Coords>(
	lastTouchXY
);