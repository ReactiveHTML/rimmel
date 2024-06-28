import { RMLTemplateExpressions } from "../types/internal";
import type { Sink, ExplicitSink } from "../types/sink";

export const CheckedSink: Sink<HTMLInputElement> = (node: HTMLInputElement) =>
    (checked: unknown) => {
        node.checked = !!checked
    };

/**
 * A specialised sink for the "checked" HTML attribute
 * @param v A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "checked" attribute
 * @example <input type="checkbox" checked="${Checked(booleanValue)}">
 * @example <input type="checkbox" checked="${Checked(booleanPromise)}">
 * @example <input type="checkbox" checked="${Checked(booleanObservable)}">
 */
export const Checked: ExplicitSink<'checked'> = (v: RMLTemplateExpressions.BooleanAttributeValue) => ({
    type: 'sink', // Do we need this?
    source: v,
    sink: CheckedSink,
});

// Usage:
// Default:     <input type="checkbox" checked="${stream}">
// Performance: <input type="checkbox" checked="${Checked(stream)}">
// Performance: <input type="checkbox" checked="${CheckedSink(stream)}">
