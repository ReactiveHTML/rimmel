import type { Coords } from '../types/coords';

import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

/**
 * An Event Source emitting the "[event.offsetX, event.offsetY]" coordinates
 * @returns EventSource<Coords>
*/
export const OffsetXY = inputPipe<PointerEvent, Coords>(
	map((e: PointerEvent) => <Coords>[e.offsetX, e.offsetY])
);

