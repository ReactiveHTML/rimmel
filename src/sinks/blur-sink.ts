import type { ExplicitSink, Sink, SinkElementTypes } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { FocusableElement } from '../types/rml';

import { SINK_TAG } from "../constants";

export const BlurSink: Sink<FocusableElement> = (node: FocusableElement) =>
	node.blur
;

/**
 * A specialised sink for the "rml:blur" RML attribute
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "disabled" attribute
 * @example <input type="text" rml:blur="${Blur(booleanValue)}">
 * @example <input type="text" rml:blur="${Blur(booleanPromise)}">
 * @example <input type="text" rml:blur="${Blur(booleanObservable)}">
 */
export const Blur: ExplicitSink<'rml:blur'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'rml:blur'>) =>
  <SinkBindingConfiguration<FocusableElement>>({
    type: SINK_TAG,
    t: 'Blur',
    source,
    sink: BlurSink,
  })
;

