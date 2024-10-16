import type { RMLTemplateExpressions, SinkBindingConfiguration } from "../types/internal";
import type { Sink } from "../types/sink";

import { AppendHTMLSink } from "../sinks/append-html-sink";
import { BlurSink } from "../sinks/blur-sink";
import { CheckedSink } from "../sinks/checked-sink";
import { ClassName, ClassObjectSink, ToggleClass } from "../sinks/class-sink";
import { ClosedSink } from "../sinks/closed-sink";
import { DatasetSink, DatasetObjectSink } from "../sinks/dataset-sink";
import { DisabledSink } from "../sinks/disabled-sink";
import { FocusSink } from "../sinks/focus-sink";
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
	['checked',         CheckedSink],
	['class',           ClassObjectSink],
	//['contenteditable', ToggleAttributePreSink('contenteditable')],
	['data-',           DatasetSink],
	['dataset',         DatasetObjectSink], // Shall we include this, too?
	['disabled',        DisabledSink],
	['innerHTML',       InnerHTMLSink],
	['innerText',       InnerTextSink],
	['readonly',        ReadonlySink],
	['style',           StyleObjectSink],
	// ['termination',  terminationSink], // a sink that runs when an observable completes... will we ever need this?
	['textContent',     TextContentSink],
	['value',           ValueSink],
	['rml:blur',        BlurSink],
//  ['rml:checked',     DisabledSink], // Can make this one act as a boolean attribute that understands "false" and other values...
	['rml:closed',      ClosedSink],
	['rml:dataset',     DatasetObjectSink],
//  ['rml:disabled',    DisabledSink], // Can make this one act as a boolean attribute that understands "false" and other values...
	['rml:focus',       FocusSink],
//  ['rml:readonly',    ReadonlySink], // Can make this one act as a boolean attribute that understands "false" and other values...
	['rml:removed',     RemovedSink],
]);


