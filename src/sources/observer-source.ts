import { isFunction } from "../utils/is-function";
import { Observer } from "../types/futures";
import { MaybeHandler } from "../types/internal";

export interface ObserverSourceHandler {
    next: (value: unknown) => void;
};

export const isObserverSource = (maybeHandler: MaybeHandler): maybeHandler is ObserverSourceHandler =>
    isFunction((<Observer<unknown>>maybeHandler).next);

/**
 * A data source that connects to and feeds an Observer stream or RxJS Subject
 * 
 * @param handler an Observer stream or RxJS Subject
 * @returns 
 */
export const ObserverSource = (handler: ObserverSourceHandler) => handler.next.bind(handler);
