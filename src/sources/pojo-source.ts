import { RMLTemplateExpression } from "../types/internal";

//export type POJOSourceExpression = Record<string, string> //[target: object | Array<string | number | object>, key: string | number];
export type POJOSourceExpression = [target: object | Array<string | number | object | Function>, key: string | number];
export const isPOJOSource = (expression: RMLTemplateExpression): expression is POJOSourceExpression =>
    Array.isArray(expression) && expression.length == 2;

/**
 * A data source that updates an object's property from an <input> element when 
 * a certain event occurs
 * @param expression an [object, 'property'] or [array, index] pair to update
 * @returns A data source
 * @example <input oninput="${[obj, 'property']}">
 * @example <input oninput="${POJOSource([obj, 'property'])}">
 * @example <input oninput="${POJOSource([arr, 4])}">
 */
export const POJOSource = (expression: POJOSourceExpression) => function() {
    // Only <input> elements are supported for this source
    const valueSource = this.type == 'checkbox' ? this.checked : this.value;

    const [target, key] = expression;
    target[key] = valueSource;
};

export const xUpdate = (object: Record<string, any>, property: string) => ({
	next: (data: any) => object[property] = data
})

export const Update = (object: Record<string, any>, property: string) =>
	POJOSource([object, property])
;
