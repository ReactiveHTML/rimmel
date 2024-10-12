import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

import { SINK_TAG } from "../constants";

export const InnerTextSink: Sink<HTMLElement> = (node: HTMLElement) =>
    (html: string) => {
        node.innerText = html
    }
;

/**
 * A specialised sink to set the innerText on an element
 * @param source A present or future string
 * @returns RMLTemplateExpression A text-node RML template expression
 * @example <div>${InnerText(stream)}</div>
 */
export const InnerText: ExplicitSink<'text'> = (source: RMLTemplateExpressions.StringLike) =>
    <SinkBindingConfiguration<HTMLElement>>({
        type: SINK_TAG,
        t: 'InnerText',
        source,
        sink: InnerTextSink,
    });

