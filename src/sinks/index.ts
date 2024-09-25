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

export const PreSink = <T extends HTMLElement>(sink: Sink<T>, source: RMLTemplateExpressions.Any, args: any) => {
	const fn = (node: T) => {
		return sink.bind(null, node, args);
	};
	return <SinkBindingConfiguration<HTMLElement>>{
        type: 'sink',
        source,
        sink,
    };
};

export { AttributeObjectSink } from "./attribute-sink";
export { AnyContentSink, AppendHTML, InnerHTML, InnerText, TextContent } from "./content-sink";
export { ClassName, ToggleClass } from './class-sink';
export { Removed } from "./removed-sink";
export { Sanitize } from './sanitize-html';
export { Signal } from './signal-sink'; // Experimental

