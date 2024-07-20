import { pipeIn } from "../utils/input-pipe";
import { map } from "rxjs";

export type Coords = [number, number];

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @returns EventSource<Coords>
 */
export const ClientXY = pipeIn<PointerEvent, Coords>(
	map(e => <Coords>[e.clientX, e.clientY])
);

export const LastTouchXY = pipeIn<TouchEvent, Coords>(
	map(e => {
		const t = [...e.touches].at(-1);
		return <Coords>[t?.clientX, t?.clientY];
	})
);
