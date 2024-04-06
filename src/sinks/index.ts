import { Sink } from "../types/sink";
import { AttributeSink, AttributesSink } from "./attribute-sink";
import { ClassSink } from "./class-sink";
import { DatasetSink, DatasetMultiSink } from "./dataset-sink";
import { AppendHTMLSink, InnerHTMLSink, InnerTextSink, TextContentSink } from "./content-sink";
import { RemovalSink } from "./removal-sink";
import { StyleMultiSink } from "./style-sink";
import { ValueSink } from "./value-sink";

// TODO: Add option to register custon sinks
export const DOMSinks: Map<string, Sink<any>> = new Map(<[string, Sink<any>][]>[
	['appendHTML',   AppendHTMLSink],
	['attribute',    AttributeSink],
	['attributeset', AttributesSink],
	['class',        ClassSink],
	['dataset',      DatasetSink],
	['innerHTML',    InnerHTMLSink],
	['innerText',    InnerTextSink],
	['multidataset', DatasetMultiSink],
	['removal',      RemovalSink],
	['style',        StyleMultiSink],
	['textContent',  TextContentSink],
	['value',        ValueSink],
	// ['termination',  terminationSink],
]);

/**
 * Force a custom Sink through to a template
 * @param sink 
 * @param data 
 * @returns Sink
 */
export const SinkSpecifier = (sink: Sink<any>, data: unknown) => ({
	type: 'custom',
	sink,
	data,
});
