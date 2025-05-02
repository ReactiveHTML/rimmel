import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { Sink, ExplicitSink } from "../types/sink";

import { SINK_TAG } from "../constants";

export const HIDDEN_SINK_TAG = 'hidden';

export const HiddenSink: Sink<HTMLElement> = (node: HTMLElement) =>
  (hidden: boolean) => {
    node.hidden = hidden
  };

/**
 * A specialised sink for the "hidden" HTML attribute
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "hidden" DOM attribute
 * @example <div hidden="${booleanValue}">
 * @example <div hidden="${booleanPromise}">
 * @example <div hidden="${booleanObservable}">
 * @example <div hidden="${Hidden(booleanPromise)}">
 */
export const Hidden: ExplicitSink<'hidden'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'hidden'>) =>
  <SinkBindingConfiguration<HTMLElement>>({
    type: SINK_TAG,
    t: HIDDEN_SINK_TAG,
    source,
    sink: HiddenSink,
  })
;

