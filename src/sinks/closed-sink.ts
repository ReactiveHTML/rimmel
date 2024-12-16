import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { ExplicitSink, Sink } from "../types/sink";

import { SINK_TAG } from "../constants";

/**
 * A sink that closes a &lt;dialog&gt; element when a source streams emits
 * @param dialogBox an HTMLDialogElement
 * @returns 
 */
export const ClosedSink: Sink<HTMLDialogElement> = (dialogBox: HTMLDialogElement) =>
    dialogBox.close.bind(dialogBox)
;

/**
 * An explicit sink that closes a &lt;dialog&gt; element when a source streams emits a non falsey value
 *
 * You can call this sink in the following ways:
 * - implicitly, by assigning it to the `rml:closed` attribute of a `<dialog>` element
 * - explicitly, by using the `Closed` sink
 * - via a {@link Mixin}, by emitting a `rml:closed` key-value pair
 *
 * @returns Sink
 *
 * ## Examples
 *
 * ### Close a &lt;dialog&gt; box when a button is clicked
 *
 * ```ts
 * import { Subject } from 'rxjs';
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const close = new Subject();
 *
 *   return rml`
 *     <dialog rml:closed="${close}">
 *       <button onclick="${close}">Close</button>
 *     </dialog>
 *   `;
 * }
 * ```
 *
 * ### Close a &lt;dialog&gt; box in 10s or when a button is clicked
 *
 * ```ts
 * import { Subject, merge } from 'rxjs';
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const close = new Subject();
 *   const timeout = new Promise(resolve => setTimeout(resolve, 10000));
 *
 *   return rml`
 *     <dialog rml:closed="${merge(close, timeout)}">
 *       <button onclick="${close}">Close</button>
 *     </dialog>
 *   `;
 * }
 * ```
 * ### Close a &lt;dialog&gt; box from a {@link Mixin}
 *
 * ```ts
 * import { Subject } from 'rxjs';
 * import { rml } from 'rimmel';
 *
 * const Autoclose = () => {
 *   const timeout = new Promise(resolve => setTimeout(resolve, 10000));
 *
 *   return {
 *     'rml:closed': timeout,
 *   };
 * };
 *
 * const Component = () => rml`
 *     <dialog ...${Autoclose}>
 *       this box will close in 10s
 *     </dialog>
 *   `;
 * }
 * ```
 */
export const Closed: ExplicitSink<'closed'> = (source: RMLTemplateExpressions.BooleanAttributeValue<'closed'>) =>
    <SinkBindingConfiguration<HTMLDialogElement>>({
        type: SINK_TAG,
        t: 'Closed',
        source,
        sink: ClosedSink,
    })
;
