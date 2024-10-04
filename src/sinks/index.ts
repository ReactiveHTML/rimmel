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

export const PreSink = <T extends Element>(sink: Sink<T>, source: RMLTemplateExpressions.Any, args: any) =>
    <SinkBindingConfiguration<T>>({
        type: 'sink',
        t: 'GenericSink',
        source,
        sink,
    })
;

export { AttributeObjectSink } from "./attribute-sink";
export { AnyContentSink, AppendHTML, InnerHTML, InnerText, TextContent } from "./content-sink";
export { ClassName, ToggleClass } from './class-sink';
export { Disabled } from "./disabled-sink";
export { JSONDump } from "./json-dump-sink";
export { Removed } from "./removed-sink";
export { Sanitize } from './sanitize-html-sink';
export { Signal } from './signal-sink'; // Experimental
export { Suspend } from './suspense'; // Experimental
