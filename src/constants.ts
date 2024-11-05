export const REF_TAG: string = '#REF';
export const REF_REGEXP: RegExp = /^#REF\d+$/;

// custom attribute and corresponding selector to find just-mounted elements
// that need any data binding
export const RESOLVE_ATTRIBUTE: string = 'RESOLVE';
export const RESOLVE_SELECTOR: string = `[${RESOLVE_ATTRIBUTE}]`;

// An equivalent of the "debugger;" JavaScript expression, for templates
export const RML_DEBUG: string = 'rml:debugger';

// Special, non-printable Unicode characters to wrap interactive text nodes
// letting Rimmel know they'll need to be rendered as Text Nodes in the DOM, for updates
export const INTERACTIVE_NODE_START = '\u200B';
export const INTERACTIVE_NODE_END   = '\u200C'; // FIXME: can't use this

export const SOURCE_TAG: string = 'source';
export const SINK_TAG: string = 'sink';

// Use a single, delegated event listener at the root level
// or attach individual event listeners or event observers to each node?
export const DELEGATE_EVENTS: boolean = false;

// Use the new native Web Platform Observables instead of addEventListener when available
export const USE_DOM_OBSERVABLES: boolean = !true;

