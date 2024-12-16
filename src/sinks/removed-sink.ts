import type { ExplicitSink, Sink } from "../types/sink";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

import { SINK_TAG } from "../constants";

/**
 * A sink that removes the given element from the DOM when the source emits
 * @param e A DOM element
 * @returns A sink that removes the element when called
 */
export const RemovedSink: Sink<Element> = (e: Element) =>
	e.remove.bind(e)
;

/**
 * Removed Sink
 *
 * A specialised sink to remove an element from the DOM when its source emits
 * Once removed the underlying element can't be restored. Most useful with <dialog> boxes and other ephemeral containers
 *
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "rml:close" attribute
 *
 * ## Examples
 *
 * ### Remove an Element
 *
 * Remove an element after 5s
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const delay = new Promise(resolve => setTimeout(resove, 5000));
 *
 *   return rml`
 *     <div rml:removed="${delay}">
 *       removing in 5s
 *     </div>
 *   `;
 * }
 * ```
 *
 * ### Remove an Element on click
 *
 * Remove an element after 5s
 *
 * ```ts
 * import { Subject } from 'rxjs';
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const remove = new Subject();
 *
 *   return rml`
 *     <div rml:removed="${remove}">
 *       <button onclick="${remove}">click to remove</button>
 *     </div>
 *   `;
 * }
 * ```
 *
 * ### Specifying the sink explicitly
 *
 * Remove an element after 5s, making the sink type explicit
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const delay = new Promise(resolve => setTimeout(resove, 5000));
 *
 *   return rml`
 *     <div ...${Removed(delay)}>
 *       removing in 5s
 *     </div>
 *   `;
 * }
 * ```
 *
 * ### Specifying the sink from a mixin
 *
 * Remove an element after 5s, using a {@link Mixin | Mixin}
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Autoremove = () => {
 *   const delay = new Promise(resolve => setTimeout(resove, 5000));
 *
 *   return {
 *     'rml:removed': delay,
 *   };
 * };
 *
 * const Component = () => rml`
 *   <div ...${Autoremove()}>
 *     will be removed when the mixin decides...
 *   </div>
 * `;
 * 
 * ```
 */
export const Removed: ExplicitSink<'mixin' | 'removed'> = (source: RMLTemplateExpressions.Any) =>
	<SinkBindingConfiguration<Element>>({
		type: SINK_TAG,
        t: 'Mixin',
		source,
		sink: RemovedSink,
	})
;
