import { Sink } from "../types/sink";
import { CheckedSink } from "./checked-sink";
import { DisabledSink } from "./disabled-sink";
import { FixedAttributePreSink } from "./attribute-sink";
import { ClosedSink } from "./closed-sink";
import { ClassName, ClassObjectSink, ToggleClass } from "./class-sink";
import { DatasetSink, DatasetObjectSink } from "./dataset-sink";
import { InsertAdjacentHTMLSink, InnerHTMLSink, InnerTextSink, TextContentSink } from "./content-sink";
import { RemovedSink } from "./removed-sink";
import { ReadonlySink } from "./readonly-sink";
import { StyleObjectSink } from "./style-sink";
import { ValueSink } from "./value-sink";
import { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";

export const sinkByAttributeName = new Map(<Iterable<readonly [string, Sink<any>]>>[
	['appendHTML',      InsertAdjacentHTMLSink],
	['contenteditable', FixedAttributePreSink('contenteditable')],
	['rml:removed',     RemovedSink],
	['rml:closed',      ClosedSink],
	['checked',         CheckedSink],
//  ['rml:checked',     DisabledSink], // Can make this one act as a boolean attribute that understands "false" and other values...
	['disabled',        DisabledSink],
//  ['rml:disabled',    DisabledSink], // Can make this one act as a boolean attribute that understands "false" and other values...
	['class',           ClassObjectSink],
	['innerHTML',       InnerHTMLSink],
	['innerText',       InnerTextSink],
	['readonly',        ReadonlySink],
//  ['rml:readonly',    ReadonlySink], // Can make this one act as a boolean attribute that understands "false" and other values...
	['style',           StyleObjectSink],
	['textContent',     TextContentSink],
	['value',           ValueSink],
	['rml:dataset',     DatasetObjectSink],
	['dataset',         DatasetObjectSink], // Shall we include this, too?
	['data-',           DatasetSink],
	// ['termination',  terminationSink], // a sink that runs when an observable completes... will we ever need this?
]);

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
export { AnyContentSink, AppendHTML, InnerHTML, InnerText, TextContent, InnerHTMLSink } from "./content-sink";
export { ClassName, ToggleClass } from './class-sink';
export { Removed } from "./removed-sink";
export { Signal } from './signal-sink';
