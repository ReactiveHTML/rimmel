import type { EventListenerFunction } from "../types/dom";
import type { RMLTemplateExpression } from "../types/internal";
import type { Source } from '../types/source';

import { autoValue } from '../utils/auto-value';

export type ObjectKey = string | number | symbol;
export type TargetObject = object | Array<string | number | object | Function>; // Record<string, unknown>;
export type ObjectSourceExpression<T extends TargetObject> = [key: keyof T, target: T];

export const isObjectSource =
  <T extends TargetObject>
  (expression: RMLTemplateExpression): expression is ObjectSourceExpression<T> =>
    Array.isArray(expression) && expression.length == 2;

/**
 * A data source that updates an object's property from an &lt;input&gt; element when 
 * a certain event occurs
 * @param key an ['property', object] or [index, array] pair to update
 * @returns A data source
 * @example <input oninput="${[obj, 'property']}">
 * @example <input oninput="${ObjectSource('property', obj)}">
 * @example <input oninput="${ObjectSource(4, arr)}">
 */
export const ObjectSource =
  <E extends Event, T extends TargetObject>
  (key: ObjectKey, targetObject?: T) => {
    const handler = ((targetObject: T, e: E) => {
      const t = e.target as HTMLInputElement;
      (targetObject as any)[key] = autoValue(t);
    });

    return (targetObject
      ? handler.bind(null, targetObject as T) as EventListenerFunction<E>
      : (t2: T)=>(handler.bind(null, t2) as EventListenerFunction<E>)
    );
  }
;

/**
 * A data source that updates an object's property from an &lt;input&gt; element when
 * a certain event occurs
 * @param property A property to update in the given object
 * @param object The object to update
 * @returns An event handler
 */
export const Update =
  <E extends Element, T extends TargetObject, I extends Event, O extends never>
  (property: ObjectKey, object?: T): ((t2: T) => EventListenerFunction<I>) | EventListenerFunction<I> | Source<I, O> =>
    ObjectSource<I, T>(property, object)
;
