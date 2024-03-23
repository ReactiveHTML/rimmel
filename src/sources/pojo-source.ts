import { MaybeHandler } from "../types/internal";

export type POJOSourceHandler = [obj: any, key?: string | number];

export const isPOJOSource = (maybeHandler: MaybeHandler): maybeHandler is POJOSourceHandler =>
    Array.isArray(maybeHandler) && maybeHandler.length == 2;

/**
 * A data source that updates an object's property when the underlying 
 * 
 * @param handler an [object, 'property'] pair to update
 * @returns 
 */
export const POJOSource = (handler: POJOSourceHandler) => function() {
    const valueSource = this.value; // Assuming it's coming from an <input> element
    const [obj, key] = handler;
    key == undefined
        ? obj.splice(key, 1)
        : obj[key] = valueSource;
};
