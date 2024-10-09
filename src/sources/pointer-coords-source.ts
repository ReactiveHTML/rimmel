import { map } from "rxjs";
import { inputPipe } from "../utils/input-pipe";

export type Coords = [number, number];

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" coordinates
 * @returns EventSource<Coords>
 */
export const ClientXY = inputPipe<PointerEvent, Coords>(
	map((e: PointerEvent) => <Coords>[e.clientX, e.clientY])
);

/**
 * An Event Source emitting the "[event.offsetX, event.offsetY]" coordinates
 * @returns EventSource<Coords>
*/
export const OffsetXY = inputPipe<PointerEvent, Coords>(
	map((e: PointerEvent) => <Coords>[e.offsetX, e.offsetY])
);

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
