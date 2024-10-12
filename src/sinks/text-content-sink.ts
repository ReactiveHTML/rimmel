import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { MaybeFuture } from "../types/futures";

import { SINK_TAG } from "../constants";

export const TextContentSink: Sink<Element> = (node: Node) =>
    (str: string) => {
        node.textContent = str
    }
;

/**
 * A specialised sink to set the textContent on a node
 * @param source A present or future string
 * @returns RMLTemplateExpression A text-node RML template expression
 * @example <div>${textContent(stream)}</div>
 */
export const TextContent: ExplicitSink<'text'> = (source: RMLTemplateExpressions.StringLike) =>
    <SinkBindingConfiguration<Element>>({
        type: SINK_TAG,
        t: 'TextContent',
        source: source,
        sink: TextContentSink,
    })
;

