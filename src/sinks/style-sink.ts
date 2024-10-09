import type { CSSDeclaration, CSSValue, CSSWritableProperty } from "../types/style";
import type { Sink } from "../types/sink";

import { asap } from "../lib/drain";

/**
 * Applies a given CSS value to a specified CSS property of an Element.
 *
 * @param Element node - The HTML element to which the CSS property will be applied.
 * @param CSSProperty key - The CSS property that will be set on the element.
 * @returns Function A function that takes a CSS value (specific to the CSS property)
 *                     and applies it to the element's style.
 * @example // Applies a background color to a div element
 * const divElement = document.getElementById('myDiv');
 * const setBackgroundColor = styleSink(divElement, 'backgroundColor');
 * setBackgroundColor('red'); // Sets the div's background color to red
**/
export const StyleSink: Sink<HTMLElement | SVGElement> = <K extends keyof CSSDeclaration>(node: HTMLElement | SVGElement, key: K) => {
	const style = node.style;
	return (value: CSSValue<K>) => {
		style[key] = value;
	}
};

export const StylePreSink = (key: CSSWritableProperty) =>
	(node: HTMLElement | SVGElement) =>
		StyleSink(node, key)
;

export const StyleObjectSink: Sink<HTMLElement | SVGElement> = (node: HTMLElement | SVGElement) => {
	const style = node.style;
	return (kvp: CSSDeclaration) =>
		Object.entries(kvp ?? {}).forEach(([k, v]) => asap(v => style[<keyof CSSWritableProperty>k] = v, v))

	;
};
