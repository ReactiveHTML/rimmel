import type { RMLTemplateExpressions } from "../types/internal";
import type { HTMLFieldElement} from "../types/dom";
import { isNumericFieldElement } from "../types/dom";

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const MouseCoords = <T extends Element>(target: RMLTemplateExpressions.SourceExpression<[number, number]>) => {
	const nextFn = target?.next?.bind(target) ?? target?.then?.bind(target) ?? target;
	return (e: PointerEvent) => {
		nextFn([e.clientX, e.clientY]);
	};
};


// MouseXY
// ClientXY
// LayerXY

