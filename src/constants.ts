export const REF_TAG='#REF';
export const REF_REGEXP = /^#REF\d+$/;

// custom attribute and corresponding selector to find just-mounted elements
// that need any data binding
export const RESOLVE_ATTRIBUTE='RESOLVE';
export const RESOLVE_SELECTOR=`[${RESOLVE_ATTRIBUTE}]`;

// An equivalent of the "debugger;" JavaScript expression, for templates
export const RML_DEBUG='rml:debugger';

// Special, non-printable Unicode characters to wrap interactive text nodes
// letting Rimmel know they'll need to be rendered as Text Nodes in the DOM, for updates
export const INTERACTIVE_NODE_START = '\u200B';
export const INTERACTIVE_NODE_END   = '\u200C'; // FIXME: can't use this

export const SOURCE_TAG = 'source'
export const SINK_TAG = 'sink'

