import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { Sink, ExplicitSink } from "../types/sink";

import { SINK_TAG } from "../constants";

export const CHECKED_SINK_TAG = 'checked';

export const CheckedSink: Sink<HTMLInputElement> = (node: HTMLInputElement) =>
  (checked: boolean) => {
    node.checked = checked
  };

/**
 * A specialised sink for the "checked" HTML attribute
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "checked" DOM attribute
 * @example <input type="checkbox" checked="${booleanValue}">
 * @example <input type="checkbox" checked="${booleanPromise}">
 * @example <input type="checkbox" checked="${booleanObservable}">
 * @example <input type="checkbox" checked="${Checked(booleanPromise)}">
 */
export const Checked: ExplicitSink<'checked'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'checked'>) =>
  <SinkBindingConfiguration<HTMLInputElement>>({
    type: SINK_TAG,
    t: CHECKED_SINK_TAG,
    source,
    sink: CheckedSink,
  })
;
