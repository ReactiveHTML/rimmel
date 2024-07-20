import { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { Sink, ExplicitSink } from "../types/sink";

export const CheckedSink: Sink<HTMLInputElement> = (node: HTMLInputElement) =>
    (checked: boolean) => {
        node.checked = checked
    };

/**
 * A specialised sink for the "checked" HTML attribute
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "checked" attribute
 * @example <input type="checkbox" checked="${Checked(booleanValue)}">
 * @example <input type="checkbox" checked="${Checked(booleanPromise)}">
 * @example <input type="checkbox" checked="${Checked(booleanObservable)}">
 */
export const Checked: ExplicitSink<'checked'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'checked'>) =>
    <SinkBindingConfiguration<HTMLInputElement>>({
        type: 'sink',
        source,
        sink: CheckedSink,
    })
;
