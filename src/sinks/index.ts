import { Sink } from "../types/sink";
import { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

// /**
//  * Force a custom Sink through to a template
//  * @param sink 
//  * @param data 
//  * @returns Sink
//  */
// export const SinkSpecifier = (source: MaybeFuture<unknown>, sink: Sink<any>, data: unknown) => ({
// 	type: 'custom',
// 	pattern: (string, resultPlusString, result) => /custom-stuff=/.test(string), // ..................
// 	sink,
// 	data,
// });

export const PreSink = <T extends Element>
	(tag: string, sink: Sink<T>, source: RMLTemplateExpressions.Any, args: any) => ({
		type: 'sink',
		t: tag,
		source,
		sink,
	}) as SinkBindingConfiguration<T>
;

//export { AnyContentSink } from "./content-sink";
//export { AppendHTML } from "./append-html-sink";
//export { AttributeObjectSink } from "./attribute-sink";
//export { Blur } from "./blur-sink";
//export { ClassName, ToggleClass } from './class-sink';
//export { Disabled } from "./disabled-sink";
//export { Focus } from "./focus-sink";
//export { InnerHTML } from "./inner-html-sink";
//export { InnerText } from "./inner-text-sink";
//export { JSONDump } from "./json-dump-sink";
//export { PrependHTML } from "./prepend-html-sink";
//export { Removed } from "./removed-sink";
//export { Sanitize } from './sanitize-html-sink';
//export { Signal } from './signal-sink'; // Experimental
//export { Suspend } from './suspense'; // Experimental
//export { TextContent } from "./text-content-sink";
//
