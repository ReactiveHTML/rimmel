import type { Coords } from '../types/coords';

import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

/**
 * An Event Source Operator emitting the "[event.clientX, event.clientY]" coordinates
 * @returns OperatorFunction<Coords>
 */
export const clientXY =
	map((e: PointerEvent) => <Coords>[e.clientX, e.clientY])
;

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" coordinates
 * @returns EventSource<Coords>
 */
export const ClientXY = inputPipe<PointerEvent, Coords>(
	clientXY
);

export const asClientXY = clientXY;
export const AsClientXY = ClientXY;
