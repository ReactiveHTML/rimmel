import type {RMLEventName} from '../types/dom';

// TODO: review, see if we can convert to a type... don't want all these in the bundles
export const NON_BUBBLING_DOM_EVENTS: Set<RMLEventName> = new Set<RMLEventName>([
    'abort',
    'canplay',
    'canplaythrough',
    'durationchange',
    'emptied',
    'ended',
    'error',
    'load',
    'loadeddata',
    'loadedmetadata',
    'pause',
    'play',
    'playing',
    'ratechange',
    'seeked',
    'seeking',
    'stalled',
    'suspend',
    'timeupdate',
    'volumechange',
    'waiting',
    'rml:mount',
]);

