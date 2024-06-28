// List of HTML boolean attributes.
// These enable a certain functionality by their mere presence in a tag.
// E.G.: <input disabled="false"> is still disabled, which is unintuitive.
// <input disabled="${stream}"> should really set or unset the disabled state depending on the stream's last emitted value!

export const BOOLEAN_ATTRIBUTES = new Set([
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'ismap',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'readonly',
    'required',
    'reversed',
    'selected'
]);
