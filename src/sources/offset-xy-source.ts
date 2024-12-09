import type { Coords } from '../types/coords';

import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

/**
 * An Event Source Operator emitting the "[event.offsetX, event.offsetY]" coordinates
 * @returns OperatorFunction<PointerEvent, <Coords>
*/
export const offsetXY = map((e: PointerEvent) => <Coords>[e.offsetX, e.offsetY]);

/**
 * An Event Adapter emitting the "[event.offsetX, event.offsetY]" coordinates
 * @returns EventSource<Coords>
*/
export const OffsetXY = inputPipe<PointerEvent, Coords>(
	offsetXY
);