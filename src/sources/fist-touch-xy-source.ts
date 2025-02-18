import type { Coords } from '../types/coords';

import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

/**
 * An Event Operator emitting the "[x, y]" coordinates of the first touch in an event
 * @returns OperatorFunction<TouchEvent, Coords>
*/
export const firstTouchXY =
	map((e: TouchEvent) => {
		const t = [...e.touches].at(0);
		return <Coords>[t?.clientX, t?.clientY];
	})
;

/**
 * An Event Source emitting the "[x, y]" coordinates of the first touch in an event
 * @returns EventSource<Coords>
*/
export const FirstTouchXY = inputPipe<TouchEvent, Coords>(
	firstTouchXY
);

export const asFirstTouchXY = firstTouchXY;
export const AsFirstTouchXY = FirstTouchXY;

