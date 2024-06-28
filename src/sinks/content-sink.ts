import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { MaybeFuture, Observable } from "../types/futures";

import { consecute } from "../lib/drain";

import { subscriptions } from "../internal-state";

// // Call the given fn on data. .then if it's
// const pipe = <T>(data: T) => (fn: (t:T)=>void) => fn(data);
// const consecute1 = <T>(fn: (t: T) => void, source: MaybeFuture<T>) =>
//   ((<Observable<T>>source).subscribe ?? (<Promise<T>>source).then ?? pipe(source))
//     .call(source, fn);

export const AnyContentSink: Sink<Element> = (node: Element) =>
    (htmlSource: MaybeFuture<string>) => {
        consecute((html: string) => node.innerHTML = html, htmlSource)
    }
;

export const InnerHTMLSink: Sink<Element> = (node: Element) =>
    (html: string) => {
        node.innerHTML = html
    }
;

export const InnerTextSink: Sink<HTMLElement> = (node: HTMLElement) =>
    (html: string) => {
        node.innerText = html
    }
;

export const TextContentSink: Sink<Node> = (node: Node) =>
    (str: string) => {
        node.textContent = str
    }
;

export const NodeValueSink: Sink<Node> = (node: Node) =>
    (str: string) => {
        node.nodeValue = str
    }
;


export const InsertAdjacentHTMLSink: Sink<Element> = (node: Element, pos: InsertPosition) =>
    node.insertAdjacentHTML.bind(node, pos)
;

/**
 * A specialised sink to set the innerHTML of an element
 * @param source A present or future HTML string
 * @returns RMLTemplateExpression An HTML-subtree RML template expression
 * @example <div>${AppendHTML(stream)}</div>
 */
export const InnerHTML: ExplicitSink<'content'> = (source: RMLTemplateExpressions.HTML, sink: Sink<Element> = InnerHTMLSink) =>
    <SinkBindingConfiguration<Element>>({
        type: 'sink',
        source,
        sink,
    })
;

/**
 * A specialised sink to set the innerText on an element
 * @param source A present or future string
 * @returns RMLTemplateExpression A text-node RML template expression
 * @example <div>${InnerText(stream)}</div>
 */
export const InnerText: ExplicitSink<'content'> = (source: RMLTemplateExpressions.Text) =>
    <SinkBindingConfiguration<Element>>({
        type: 'sink',
        source,
        sink: InnerTextSink,
    });

/**
 * A specialised sink to set the textContent on a node
 * @param source A present or future string
 * @returns RMLTemplateExpression A text-node RML template expression
 * @example <div>${textContent(stream)}</div>
 */
export const TextContent: ExplicitSink<'text'> = (source: RMLTemplateExpressions.Text) =>
    <SinkBindingConfiguration<Element>>({
        type: 'sink',
        source: source,
        sink: TextContentSink,
    })
;

/**
 * A specialised sink to set the nodeValue on a node
 * @param source A present or future string
 * @returns RMLTemplateExpression A text-node RML template expression
 * @example <div>${NodeValue(stream)}</div>
 */
export const NodeValue: ExplicitSink<'text'> = (source: RMLTemplateExpressions.Text) =>
    <SinkBindingConfiguration<Element>>({
        type: 'sink',
        source: source,
        sink: NodeValueSink,
    })
;


/**
 * A specialised sink to append HTML to the end of an element
 * @param source A present or future HTML string
 * @returns RMLTemplateExpression An HTML-subtree RML template expression
 * @example <div>${AppendHTML(stream)}</div>
 */
export const AppendHTML: ExplicitSink<'content'> = (source: RMLTemplateExpressions.HTML, pos: InsertPosition = 'beforeend') =>
    <SinkBindingConfiguration<Element>>({
        type: 'sink',
        source,
        sink: InsertAdjacentHTMLSink,
        params: pos,
    });

/**
 * A specialised sink to prepend HTML at the beginning of an element
 * @param source A present or future HTML string
 * @returns RMLTemplateExpression An HTML-subtree RML template expression
 * @example <div>${PrependHTML(stream)}</div>
 */
export const PrependHTML: ExplicitSink<'content'> = (source: RMLTemplateExpressions.HTML, pos: InsertPosition = 'afterbegin') =>
    <SinkBindingConfiguration<Element>>({
        type: 'sink',
        source,
        sink: InsertAdjacentHTMLSink,
        params: pos,
    })
;

