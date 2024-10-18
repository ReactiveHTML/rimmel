import type { Coords } from '../types/coords';

import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" coordinates
 * @returns EventSource<Coords>
 */
export const ClientXY = inputPipe<PointerEvent, Coords>(
	map((e: PointerEvent) => <Coords>[e.clientX, e.clientY])
);

