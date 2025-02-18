import { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import { ExplicitSink } from "../types/sink";
import { AttributeObjectSink } from "./attribute-sink";

import { SINK_TAG } from "../constants";

export const MIXIN_SINK_TAG = 'mixin';


/**
 * A specialised sink to merge all properties of an object into a target element.
 * If you pass a plain object it will be merged immediately. You can also merge event listeners on mount.
 * If you pass a future, it will be merged whenever it emits any data.
 * @param source A present or future Attribuend Object (a plain object of key-values to merge) that will be merged into the target element
 * @returns SinkBindingConfiguration an object that tells Rimmel what to mount where and how
 * You can specify this sink in the following ways:
 * - implicitly, by passing it into a tag: `<div ...${source}">`
 * - explicitly, with the `<div ...${Mixin(source)}">` sink
 *
 * ## Examples
 *
 * ### Add an event listener to a button after 5s
 *
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const delay = (ms: number) => new Promise(resolve => setTimeout(resolve), ms);
 *
 * const ClickMixin = async () => {
 *   const listener = (e: Event) => {
 *     debugger;
 *   }
 *
 *   await delay(5000);
 *
 *   return {
 *     onclick: listener,
 *   };
 *  }
 *
 *  // Using the mixin:
 *  target.innerHTML = rml`
 *    <button ...${ClickMixin()}">
 *      click me
 *    </button>
 *  `;
 * };
 * ```
 *
 * ### Drag'n'drop with a mixin
 *
 * ```ts
 * import { Subject, fromEvent, map, switchMap, takeUntil, tap } from 'rxjs';
 * 
 * const currentXY = (str: string) => /translate\((?<x0>[-.\d]+)px, (?<y0>[-.\d]+)px\)/.exec(str)?.groups ?? {x0: '0', y0: '0'};
 * 
 * export const Draggable = () => {
 *   const toCSSTransform = () => map(([Δx, Δy]) => ({
 *     transform: `translate(${Δx}px, ${Δy}px)`
 *   }));
 * 
 *   const dnd = new Subject().pipe(
 *     tap((e: PointerEvent) => e.preventDefault()),
 *     switchMap((e: PointerEvent) => {
 *       const mousemove = fromEvent(document, 'mousemove')
 *       const mouseup = fromEvent(document, 'mouseup');
 * 
 *       const {x0, y0} = currentXY((<HTMLElement>e.currentTarget).style.transform);
 *       const [eX, eY] = [e.clientX -parseFloat(x0), e.clientY -parseFloat(y0)];
 * 
 *       return mousemove.pipe(
 *         map((e: PointerEvent) => [e.clientX -eX, e.clientY -eY]),
 *         toCSSTransform(),
 *         takeUntil(mouseup),
 *       );
 *     }),
 *   );
 * 
 *   return {
 *     class: 'draggable',
 *     onmousedown: dnd,
 *     style: dnd,
 *   };
 * };
 * ```
 */
export const Mixin: ExplicitSink<'mixin'> = (source: RMLTemplateExpressions.Mixin) => {
	return <SinkBindingConfiguration<Element>>{
		type: SINK_TAG,
		t: MIXIN_SINK_TAG,
		source,
		sink: AttributeObjectSink,
	};
};

