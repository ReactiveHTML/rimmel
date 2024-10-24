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
export type * from './types/sink';
export type * from './types/internal';
export type * from './types/futures';
export type * from './types/dom';

// Event Mapping Functions
export { feed, feedIn, inputPipe, pipeIn } from './utils/input-pipe';

// Event Sources
export { Dataset } from './sources/dataset-source';
export { Numberset } from './sources/numberset-source';
export { EventData } from './sources/event-data';
export { EventTarget } from './sources/event-target';
export { Form } from './sources/form-data-source';
export { Key } from './sources/keyboard-source';
export { Update } from './sources/object-source';
export { ClientXY } from './sources/client-xy-source';
export { OffsetXY } from './sources/offset-xy-source';
export { LastTouchXY } from './sources/last-touch-xy-source';
export { Value, ValueAsDate, ValueAsNumber } from './sources/value-source';

// Data Sinks
export { AnyContentSink } from "./sinks/content-sink";
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
export type { Component, Mixin } from './types/constructs';
export type { RMLTemplateExpressions } from './types/internal';

export { source, sink } from './utils/input-pipe';

// Other Low-Level Utilities
export { Rimmel_Bind_Subtree, Rimmel_Mount } from './lifecycle/data-binding';
export { RESOLVE_SELECTOR, RML_DEBUG, SINK_TAG } from './constants';

// Main entries
export { rml } from './parser/parser';
export { rml as html } from './parser/parser'; // Shall we?

// Experimental stuff
// export { rml } from 'rml/scandal';

