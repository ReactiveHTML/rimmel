import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

/**
 * A sink that removes the given element from the DOM when the source emits
 * @param e A DOM element
 * @returns A sink that removes the element when called
 */
export const RemovedSink: Sink<Element> = (e: Element) =>
	e.remove.bind(e)
;

/**
 * A specialised sink to remove the element from the DOM when the source emits any value of any type
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "rml:close" attribute
 * @example <dialog rml:close="${Removed(booleanValue)}">
 * @example <dialog ...${Removed(booleanValue)}>
 */
export const Removed: ExplicitSink<'mixin' | 'removed'> = (source: RMLTemplateExpressions.Any) =>
	<SinkBindingConfiguration<Element>>({
		type: 'sink',
		source,
		sink: RemovedSink,
	})
;
