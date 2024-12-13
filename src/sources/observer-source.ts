import type { Observature, Observer } from "../types/futures";
import type { RMLTemplateExpression } from "../types/internal";
import { isFunction } from "../utils/is-function";

export interface ObserverSourceHandler {
    next: (value: unknown) => void;
};

/**
 * Checks whether the provided template expression is an Observer (Rx Subscribable)
 * @param expression a template expression to check
 * @returns is ObserverSourceHandler
 */
export const isObserverSource = (expression: RMLTemplateExpression): expression is ObserverSourceHandler =>
    isFunction((<Observer<unknown>>expression)?.next);

/**
 * A data source that connects to and feeds an Observer stream or RxJS Subject
 * 
 * @param handler an Observer stream or RxJS Subject
 * @returns 
 */
export const ObserverSource = (handler: ObserverSourceHandler) => handler.next.bind(handler);
// TODO: we used to just chain handler.next?.bind(handler) ?? .... rather than these type guards. Can we still, somehow?


export const isObservatureSource = (expression: RMLTemplateExpression): expression is ObservatureSourceHandler =>
    expression?.Observature || (<Observature<unknown>>expression)[Symbol.for('observature')]
;

export const ObservatureSource = (handler: ObservatureSourceHandler) => handler;

