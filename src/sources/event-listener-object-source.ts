import type { Observature, Observer } from "../types/futures";
import type { RMLTemplateExpression } from "../types/internal";
import { isFunction } from "../utils/is-function";

export interface EventListenerObject {
	handleEvent: (value: unknown) => void;
};

/**
 * Checks whether the provided template expression is an EventListenerObject
 * @param expression a template expression to check
 * @returns is EventListenerObject
 */
export const isEventListenerObjectSource = (expression: RMLTemplateExpression): expression is EventListenerObject =>
	expression?.handleEvent
;

/**
 * A data source that connects to and feeds an EventListenerObject via its handleEvent method
 * @param handler an Observer stream or RxJS Subject
 * @returns 
 */
export const EventListenerObjectSource = (handler: EventListenerObject) => handler.handleEvent.bind(handler);
// TODO: we used to just chain handler.handleEvent?.bind(handler) ?? .... rather than these type guards. Can we still, somehow?

