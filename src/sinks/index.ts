import { Sink } from "../types/sink";
import { AttributeSink, AttributeObjectSink } from "./attribute-sink";
import { ClassSink } from "./class-sink";
import { DatasetSink, DatasetObjectSink } from "./dataset-sink";
import { AppendHTMLSink, InnerHTMLSink, InnerTextSink, TextContentSink } from "./content-sink";
import { RemovalSink } from "./removal-sink";
import { StyleObjectSink } from "./style-sink";
import { ValueSink } from "./value-sink";

// TODO: Add option to register custon sinks
export const DOMSinks: Map<string, Sink<any>> = new Map(<[string, Sink<any>][]>[
	['appendHTML',      AppendHTMLSink],
	['attribute',       AttributeSink],
	['attributeobject', AttributeObjectSink],
	['class',           ClassSink],
	['dataset',         DatasetSink],
	['datasetobject',   DatasetObjectSink],
	['innerHTML',       InnerHTMLSink],
	['innerText',       InnerTextSink],
	['removal',         RemovalSink],
	['style',           StyleObjectSink],
	['textContent',     TextContentSink],
	['value',           ValueSink],
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
