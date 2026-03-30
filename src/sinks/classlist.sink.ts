import type { MaybeFuture } from "../types";
import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { Sink, ExplicitSink } from "../types/sink";

import { SINK_TAG } from "../constants";
import { asap } from "../lib/drain";
import { ObjectMap } from "../lib/object-map";

export const CLASSLIST_SINK_TAG = 'classlist';

export interface ClassListObject {
	set?: MaybeFuture<ClassName | ClassName[]>;
	add?: MaybeFuture<ClassName | ClassName[]>;
	remove?: MaybeFuture<ClassName | ClassName[]>;
	toggle?: MaybeFuture<ClassName | ClassName[]>;
};

export type ClassName = string;

export const ClassListSink: Sink<Element> = (node: Element) => {
	const tokenList = node.classList;
	const tokenAccessors = ObjectMap({
		set: (str: string) => node.className = str,
		add: tokenList.add.bind(tokenList),
		remove: tokenList.remove.bind(tokenList),
		toggle: tokenList.toggle.bind(tokenList),
	});

	return (data: ClassListObject) => {
		Object.entries(data)
			.forEach(([k, v]) => {
				tokenAccessors[k] && asap(tokenAccessors[k], v);
			})
		;
	};
};

/**
 * A specialised sink for the various methods of the "classList" DOM interface.
 * You will use this from Mixins
 * @example
 * ```
 * const mix = {
 *   classList: {
 *     add: from(['cls1', 'cls2', 'cls3']),
 *     remove: Promise.resolve('cls4'),
 *     toggle: 'cls5',
 *   }
 * };
 * 
 * const template = rml`
 *   <div ${mix}>Set classes here</div>
 * `;
 * ```
**/
export const ClassList: ExplicitSink<'class'> = (source: RMLTemplateExpressions.ClassName) =>
	<SinkBindingConfiguration<HTMLElement | SVGElement>>({
		type: SINK_TAG,
		t: 'ClassList',
		source,
		sink: ClassListSink,
	})
;
