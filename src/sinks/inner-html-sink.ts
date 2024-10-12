import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

import { SINK_TAG } from "../constants";

export const InnerHTMLSink: Sink<Element> = (node: Element) =>
    (html: string) => {
        node.innerHTML = html
    }
;

/**
 * A specialised sink to set the innerHTML of an element
 * @param source A present or future HTML string
 * @returns RMLTemplateExpression An HTML-subtree RML template expression
 * @example <div>${InnerHTML(stream)}</div>
 */
export const InnerHTML: ExplicitSink<'content'> = (source: RMLTemplateExpressions.HTMLText) =>
    <SinkBindingConfiguration<Element>>({
        type: SINK_TAG,
        t: 'InnerHTML',
        source,
        sink: InnerHTMLSink,
    })
;

