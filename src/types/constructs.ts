import type { DocumentObject, HTMLString } from "./dom";
import type { MaybeFuture } from "./futures";

/**
 * A Mixin is a function returning a DOM Object that can
 * be merged into a target or "host" element, enriching it
 * with attributes, classes, dataset, styles and event
 * handlers to provide extra functionality
 * @example () => ({
 *   onmousemove: () => doSomething,
 *   class: classStream
 * })
 **/
export type Mixin = (args?: any) => MaybeFuture<DocumentObject>;

/**
 * A RML component returns template literals tagged with rml
 * @example () => rml`
 *     <div>${content}</div>
 * `
 */
export type Component = (inputs?: Record<string, any>, effects?: Record<string, any>) => HTMLString;
