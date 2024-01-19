import { Sink } from "../types/sink";
import { attributeSink, attributesSink } from "./attribute-sink";
import { classSink } from "./class-sink";
import { datasetSink, datasetMultiSink } from "./dataset-sink";
import { appendHTMLSink, innerHTMLSink, innerTextSink, textContentSink } from "./content-sink";
import { styleMultiSink } from "./style-sink";
import { valueSink } from "./value-sink";

// TODO: Add option to register custon sinks
export const DOMSinks: Map<string, Sink> = new Map(<[string, Sink][]>[
	['appendHTML',   appendHTMLSink],
	['attribute',    attributeSink],
	['attributeset', attributesSink],
	['class',        classSink],
	// ['collection',   CollectionSink],
	['dataset',      datasetSink],
	['innerHTML',    innerHTMLSink],
	['innerText',    innerTextSink],
	['multidataset', datasetMultiSink],
	['style',        styleMultiSink],
	['textContent',  textContentSink],
	['value',        valueSink],
	// ['termination',  terminationSink],
]);

/**
 * Force a custom Sink through to a template
 * @param sink 
 * @param data 
 * @returns Sink
 */
export const SinkSpecifier = (sink: Sink, data: unknown) => ({
	type: 'custom',
	sink,
	data,
});
