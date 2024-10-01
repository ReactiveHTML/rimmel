import type { ExplicitSink, Sink, SinkElementTypes } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

import { SINK_TAG } from "../constants";

/**
 * An Element supporting the "disabled" HTML attribute (i.e.: that can be disabled)
 */
type Disableable = SinkElementTypes["disabled"]["elements"];

export const DisabledSink: Sink<Disableable> = (node: Disableable) =>
    (value: boolean) => {
  		node.disabled = value;
    };
;

/**
 * A specialised sink for the "disabled" HTML attribute
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "disabled" attribute
 * @example <input type="button" disabled="${Disabled(booleanValue)}">
 * @example <input type="button" disabled="${Disabled(booleanPromise)}">
 * @example <input type="button" disabled="${Disabled(booleanObservable)}">
 */
export const Disabled: ExplicitSink<'disabled'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'disabled'>) =>
  <SinkBindingConfiguration<Disableable>>({
    type: SINK_TAG,
    source,
    sink: DisabledSink,
  })
;
