import type { RenderingScheduler } from './types/schedulers';

declare global {
  interface Window {
    RMLREF: string;
  }
}
self.RMLREF='';

export const REF_TAG: string = 'RMLREF+';
export const REF_REGEXP: RegExp = /^RMLREF+\d+$/;

// custom attribute and corresponding selector to find just-mounted elements
// that need any data binding
export const RESOLVE_ATTRIBUTE: string = 'resolve'; // keep lowercase for SVG
export const RESOLVE_SELECTOR: string = `[${RESOLVE_ATTRIBUTE}]`;

// An equivalent of the "debugger;" JavaScript expression, for templates
export const RML_DEBUG: string = 'rml:debugger';

// Special, non-printable Unicode characters to wrap interactive text nodes
// letting Rimmel know they'll need to be rendered as Text Nodes in the DOM, for updates
export const INTERACTIVE_NODE_START = '\u200B';
export const INTERACTIVE_NODE_END   = '\u200C'; // FIXME: can't use this

export const SOURCE_TAG: string = 'source';
export const SINK_TAG: string = 'sink';

// Use the new native Web Platform Observables instead of addEventListener when available
export var USE_DOM_OBSERVABLES: boolean = false;
export const set_USE_DOM_OBSERVABLES = ((x: boolean) =>  USE_DOM_OBSERVABLES = x);

export const SymbolObservature = Symbol.for('observature');

// export var renderingScheduler = '../schedulers/ema-animation-frame';
export var renderingScheduler: RenderingScheduler | null = null;
export const setRenderingScheduler = (scheduler: RenderingScheduler) => renderingScheduler = scheduler; 

// export const configure = () => {
// 	return rml
// }
