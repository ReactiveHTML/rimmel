import { isObjectSource, ObjectSource, ObjectSourceExpression } from "../sources/object-source";
import { isObserverSource, ObserverSource } from "../sources/observer-source";
import { isEventListenerObjectSource, EventListenerObjectSource } from "../sources/event-listener-object-source";
import { EventListenerFunction } from "../types/dom";
import { RMLTemplateExpression } from "../types/internal";
import { isFunction } from "./is-function";

/**
 * Convert a function, Observer or Observature to a listener function.
 * @param expression RMLTemplateExpression
 * @returns function | null a callable event listener function
 */
export const toListener = (expression: RMLTemplateExpression): EventListenerFunction | null =>
    // FIXME: too similar to callable. Merge them
    isObserverSource(expression) ? ObserverSource(expression)
    : isFunction(expression) ? expression
    : isEventListenerObjectSource(expression) ? EventListenerObjectSource(expression)
    : isObjectSource(expression) ? ObjectSource(...(expression as ObjectSourceExpression<typeof expression[1]>))
    : null // We allow it to be empty. If so, ignore, and don't connect any source. Perhaps add a warning in debug mode?
;
