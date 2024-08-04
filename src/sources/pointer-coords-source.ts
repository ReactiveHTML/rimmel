import { prepipe } from "../utils/input-pipe";
import { map } from "rxjs";

export type Coords = [number, number];

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @returns EventSource<Coords>
 */
export const ClientXY = prepipe<PointerEvent, Coords>(
	map((e: PointerEvent) => <Coords>[e.clientX, e.clientY])
);

export const LastTouchXY = prepipe<TouchEvent, Coords>(
	map((e: TouchEvent) => {
		const t = [...e.touches].at(-1);
		return <Coords>[t?.clientX, t?.clientY];
	})
);
