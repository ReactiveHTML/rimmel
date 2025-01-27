import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { FocusableElement } from '../types/rml';

import { SINK_TAG } from "../constants";

export const FOCUS_SINK_TAG = 'focus';

export const FocusSink: Sink<FocusableElement> = (node: FocusableElement) =>
	(state: boolean) => {
		state ? node.focus?.() : node.blur?.();
	};
;

/**
 * A specialised sink for the "rml:focus" RML attribute
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "disabled" attribute
 * @example <input type="text" rml:focus="${Focus(booleanValue)}">
 * @example <input type="text" rml:focus="${Focus(booleanPromise)}">
 * @example <input type="text" rml:focus="${Focus(booleanObservable)}">
 */
export const Focus: ExplicitSink<'rml:focus'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'rml:focus'>) =>
	<SinkBindingConfiguration<FocusableElement>>({
		type: SINK_TAG,
		t: FOCUS_SINK_TAG,
		source,
		sink: FocusSink,
	})
;
