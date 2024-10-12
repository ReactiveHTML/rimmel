import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

import { SINK_TAG } from "../constants";

export const PrependHTMLSink: Sink<Element> =
    (node: Element) =>
        node.insertAdjacentHTML.bind(node, 'afterbegin')
;

/**
 * A specialised sink to prepend HTML at the beginning of an element
 * @param source A present or future HTML string
 * @returns RMLTemplateExpression An HTML-subtree RML template expression
 * @example <div>${PrependHTML(stream)}</div>
 */
export const PrependHTML: ExplicitSink<'content'> = (source: RMLTemplateExpressions.HTMLText, pos: InsertPosition = 'afterbegin') => <SinkBindingConfiguration<Element>>({
        type: SINK_TAG,
        t: 'PrependHTML',
        source,
        sink: PrependHTMLSink,
        params: pos,
    })
;

