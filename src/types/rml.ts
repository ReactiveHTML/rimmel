/**
 * An Element supporting the "rml:focus" RML attribute (i.e.: that can be focused)
 */
export interface FocusableElement extends Element {
	focus: () => void;
	blur: () => void;
};

