/**
 * An Element supporting the focus attribute (i.e.: that can be focused, like a button, a text box, etc)
 */
export type FocusableElement = HTMLElement & { focus: () => void; blur: () => void };

