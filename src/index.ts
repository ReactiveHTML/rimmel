import { Rimmel_Mount } from './lifecycle/data-binding';
// import { rml } from './parser/parser';

export const init = (root = document.documentElement) => {
	const mo = new MutationObserver(Rimmel_Mount);
	mo.observe(root, { attributes: false, childList: true, subtree: true });
};

// import { Rimmel_Bind_Subtree } from './lifecycle/data-binding';
// export const activate = Rimmel_Bind_Subtree;

/*
export const setRoot = (e: Element): RML => {
	const root = e;
	init(root);
	return rml;
}
*/

init();

// Types
export * from './types/attribute';
export * from './types/coords';
export * from './types/dom';
export * from './types/event-listener';
export * from './types/futures';
export * from './types/internal';
export * from './types/rml';
export * from './types/sink';
export * from './types/source';
export * from './types/style';
export * from './definitions/boolean-attributes';
export * from './utils/input-pipe';
export * from './sources/object-source';

// Event Mapping Functions
export { feed, feedIn, inputPipe, pipeIn } from './utils/input-pipe';

// Event Source Modifiers
export { Active } from './sources/modifiers/active';
export { Passive } from './sources/modifiers/passive';

// Event Sources
export { All, qs } from './sources/all-source';
export { CheckedState } from './sources/checked-source';
export { Cut, cut } from './sources/cut-source';
export { Dataset, DatasetObject } from './sources/dataset-source';
export { Numberset } from './sources/numberset-source';
export { EventData, eventData } from './sources/event-data';
export { EventTarget } from './sources/event-target';
export { Form, form } from './sources/form-data-source';
export { Key, key } from './sources/keyboard-source';
export { Update } from './sources/object-source';
export { ClientXY } from './sources/client-xy-source';
export { OffsetXY } from './sources/offset-xy-source';
export { LastTouchXY } from './sources/last-touch-xy-source';
export { Swap } from './sources/swap-source';
export { Value, ValueAsDate, ValueAsNumber, value, valueAsString, valueAsDate, valueAsNumber } from './sources/value-source';

// Data Sinks
export { AnyContentSink } from "./sinks/content-sink";
export { AttributeObjectSink } from "./sinks/attribute-sink";
// Data Sinks
export { AppendHTML } from './sinks/append-html-sink';
export { Blur } from './sinks/blur-sink';
export { Checked } from './sinks/checked-sink';
export { ClassName, ToggleClass } from './sinks/class-sink';
export { Closed } from './sinks/closed-sink';
export { Disabled } from './sinks/disabled-sink';
export { Catch } from './sinks/error-sink';
export { Focus } from './sinks/focus-sink';
export { InnerHTML } from './sinks/inner-html-sink';
export { InnerText } from './sinks/inner-text-sink';
export { Mixin } from './sinks/mixin-sink';
export { JSONDump } from './sinks/json-dump-sink';
export { PrependHTML } from './sinks/prepend-html-sink';
//export { Readonly } from './sinks/readonly-sink';
export { Removed } from './sinks/removed-sink';
export { Sanitize } from './sinks/sanitize-html-sink';
export { Suspend } from './sinks/suspense-sink';
export { TextContent } from './sinks/text-content-sink';

// Experimental Web Component support
export { RegisterElement } from './custom-element';

// Utilities (Will take them out to the framework)
export type { Component } from './types/constructs';
export type { RimmelComponent, RMLTemplateExpressions } from './types/internal';

export { source, sink } from './utils/input-pipe';

// Other Low-Level Utilities
export { Rimmel_Bind_Subtree, Rimmel_Mount } from './lifecycle/data-binding';
export { RESOLVE_SELECTOR, RML_DEBUG, SINK_TAG } from './constants';
export { set_DELEGATE_EVENTS, set_USE_DOM_OBSERVABLES } from './constants';

// Main entries
export { rml } from './parser/parser';
export { rml as html } from './parser/parser'; // Shall we?

// Experimental stuff
// export { rml } from 'rml/scandal';

