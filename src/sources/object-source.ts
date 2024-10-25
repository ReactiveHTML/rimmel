import type { EventListenerFunction } from "../types/dom";
import type { RMLTemplateExpression } from "../types/internal";

export type TargetObject = object | Array<string | number | object | Function>; // Record<string, unknown>;
export type ObjectSourceExpression<T extends TargetObject> = [target: T, key: keyof T];

export const isObjectSource = <T extends TargetObject>(expression: RMLTemplateExpression): expression is ObjectSourceExpression<T> =>
    Array.isArray(expression) && expression.length == 2;

/**
 * A data source that updates an object's property from an <input> element when 
 * a certain event occurs
 * @param expression an [object, 'property'] or [array, index] pair to update
 * @returns A data source
 * @example <input oninput="${[obj, 'property']}">
 * @example <input oninput="${ObjectSource([obj, 'property'])}">
 * @example <input oninput="${ObjectSource([arr, 4])}">
 */
export const ObjectSource = <E extends Event, T extends TargetObject>(expression: ObjectSourceExpression<T>) =>
    <EventListenerFunction<E>>((e: E) => {
        // Only <input> elements are supported for this source
        const t = (<HTMLInputElement>e.target)
        const valueSource = t.type == 'checkbox' ? t.checked : t.tagName == 'INPUT' ? t.value : t.innerText;
        const [target, key] = <[Record<string, any>, string] | [Array<any>, number]>expression;
        (<any>target[<any>key]) = valueSource;
    })
;

/**
 * A data source that updates an object's property from an <input> element when
 * a certain event occurs
 * @param object The object to update
 * @param property A property to update in the given object
 * @returns An event handler stream
 */
export const Update = <E extends Element, T extends TargetObject, I extends Event, O extends never>(object: T, property: keyof T): EventListenerFunction<I> =>
    ObjectSource<I, T>([object, property])
;
