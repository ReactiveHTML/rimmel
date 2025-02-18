import type { DOMSubtreeObject, RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { HTMLContainerElement } from "../types/dom";
import type { Sink, ExplicitSink } from "../types/sink";

import { AttributeObjectSink } from "./attribute-sink";

import { SINK_TAG } from "../constants";

export const SubtreeSink: Sink<HTMLInputElement> =
	(node: HTMLContainerElement) =>
		(subtreeData: DOMSubtreeObject) => {
			Object.entries(subtreeData)
				.forEach(([k, v]) =>
					[...node.querySelectorAll(k)].forEach((e: Element) =>
						AttributeObjectSink(e as HTMLContainerElement)(v)
					)
				);
		};

/**
 * A specialised sink to deep-merge a DOM subtree into the target element
 * @param source A present or future DOM Subtree Object
 * @returns RMLTemplateExpression A template expression for the "checked" attribute
 * @remarks Most useful in a mixin
 * @example <div>${Subtree(subtreeObject)}</div>
 */
export const Subtree: ExplicitSink<'subtree'> =
	(source: RMLTemplateExpressions.Any) => ({
		type: SINK_TAG,
		t: 'subtree',
		source,
		sink: SubtreeSink,
	}) as SinkBindingConfiguration<HTMLContainerElement | SVGElement | MathMLElement>
;
