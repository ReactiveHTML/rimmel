import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { MaybeFuture } from "../types/futures";

import { SINK_TAG } from "../constants";
import { asap } from "../lib/drain";

export const AnyContentSink: Sink<Element> = (node: Element) =>
    (htmlSource: MaybeFuture<string>) => {
        asap((html: string) => node.innerHTML = html, htmlSource)
    }
;

export const NodeValueSink: Sink<Element | Text> = (node: Node) =>
    (str: string) => {
        node.nodeValue = str
    }
;

/**
 * A specialised sink to set the nodeValue on a node
 * @param source A present or future string
 * @returns RMLTemplateExpression A text-node RML template expression
 * @example <div>${NodeValue(stream)}</div>
 */
export const NodeValue: ExplicitSink<'text'> = (source: RMLTemplateExpressions.StringLike) =>
    <SinkBindingConfiguration<Element>>({
        type: SINK_TAG,
        t: 'NodeValue',
        source,
        sink: NodeValueSink,
    })
;

