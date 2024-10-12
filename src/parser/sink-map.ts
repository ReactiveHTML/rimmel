import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { Sink } from "../types/sink";

import { AppendHTMLSink } from "../sinks/append-html-sink";
import { CheckedSink } from "../sinks/checked-sink";
import { ClassName, ClassObjectSink, ToggleClass } from "../sinks/class-sink";
import { ClosedSink } from "../sinks/closed-sink";
import { DatasetSink, DatasetObjectSink } from "../sinks/dataset-sink";
import { DisabledSink } from "../sinks/disabled-sink";
import { InnerHTMLSink } from "../sinks/inner-html-sink";
import { InnerTextSink } from "../sinks/inner-text-sink";
import { ReadonlySink } from "../sinks/readonly-sink";
import { RemovedSink } from "../sinks/removed-sink";
import { StyleObjectSink } from "../sinks/style-sink";
import { TextContentSink } from "../sinks/text-content-sink";
import { ToggleAttributePreSink } from "../sinks/attribute-sink";
import { ValueSink } from "../sinks/value-sink";

export const sinkByAttributeName = new Map(<Iterable<readonly [string, Sink<any>]>>[
	['appendHTML',      AppendHTMLSink],
	//['contenteditable', ToggleAttributePreSink('contenteditable')],
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


