import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

import { SINK_TAG } from "../constants";

export const APPEND_HTML_SINK_TAG = 'appendHTML';

export const AppendHTMLSink: Sink<Element> =
	(node: Element) =>
		node.insertAdjacentHTML.bind(node, 'beforeend')
;

/**
 * A specialised sink to append HTML to the end of an element
 * @param source A present or future HTML string
 * @returns RMLTemplateExpression An HTML-subtree or RML template expression
 * @example <div>${AppendHTML(stream)}</div>
 */
export const AppendHTML: ExplicitSink<'content'> = (source: RMLTemplateExpressions.HTMLText, pos: InsertPosition = 'beforeend') =>
	<SinkBindingConfiguration<Element>>({
		type: SINK_TAG,
		t: APPEND_HTML_SINK_TAG,
		source,
		sink: AppendHTMLSink,
		params: pos,
	})
;

