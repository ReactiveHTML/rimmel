import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

import { SINK_TAG } from "../constants";

export const TEXT_CONTENT_SINK_TAG = 'TextContent';

export const TextContentSink: Sink<Element> = (node: Node) =>
	(str: string) => {
		node.textContent = str
	}
;

/**
 * A specialised sink to set the textContent on a node
 * @param source A present or future string
 * @textNodeOnly A flag to only apply the sink to text child nodes of a node, not its whole text content
 * @returns RMLTemplateExpression A text-node RML template expression
 * @example <div>${TextContent(stream)}</div>
 */
export const TextContent: ExplicitSink<'text'> = (source: RMLTemplateExpressions.StringLike, textNodeOnly=false) =>
	<SinkBindingConfiguration<Element>>({
		type: SINK_TAG,
		t: TEXT_CONTENT_SINK_TAG,
		source: source,
		sink: TextContentSink,
		textNodeOnly,
	})
;
