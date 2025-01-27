import type { ExplicitSink, Sink } from "../types/sink";
import type { SinkBindingConfiguration } from "../types/internal";
import type { MaybeFuture } from "../types/futures";

import { SINK_TAG } from "../constants";

export const JSON_DUMP_SINK_TAG = 'jsonDump';

export const JSONDumpSink: Sink<Element> = (node: Element) =>
	(data: object) => {
		node.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`
	}
;

/**
 * A specialised sink to print source data as JSON strings
 * @param source A present or future JavaScript Object
 * @returns RMLTemplateExpression An HTML-subtree RML template expression
 * @example <div>${JSONDump(objectStream)}</div>
 */
export const JSONDump: ExplicitSink<'object'> = (source: MaybeFuture<Object>) =>
	<SinkBindingConfiguration<Element>>({
		type: SINK_TAG,
		t: JSON_DUMP_SINK_TAG,
		source,
		sink: JSONDumpSink,
	})
;
