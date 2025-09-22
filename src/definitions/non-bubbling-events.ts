import type {RMLEventName} from '../types/dom';

// TODO: if we keep using this, maybe convert it to a type
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
