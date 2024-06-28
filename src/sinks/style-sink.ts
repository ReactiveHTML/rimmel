import type { CSSDeclaration, CSSValue } from "../types/style";
import type { Sink } from "../types/sink";

/**
 * Applies a given CSS value to a specified CSS property of an Element.
 *
 * @param {Element} node - The HTML element to which the CSS property will be applied.
 * @param {CSSProperty} key - The CSS property that will be set on the element.
 * @returns {Function} A function that takes a CSS value (specific to the CSS property)
 *                     and applies it to the element's style.
 * @example
 * // Applies a background color to a div element
 * const divElement = document.getElementById('myDiv');
 * const setBackgroundColor = styleSink(divElement, 'backgroundColor');
 * setBackgroundColor('red'); // Sets the div's background color to red
 */
export const StyleSink: Sink<HTMLElement> = <K extends keyof CSSDeclaration>(node: HTMLElement, key: K) =>
	(value: CSSValue<K>) => {
		node.style[key] = value;
	};

export const StyleObjectSink: Sink<HTMLElement> = (node: HTMLElement) => {
	const style = node.style;
	return (kvp: CSSDeclaration) =>
		Object.entries(kvp ?? {}).forEach(([k, v]) => style[k] = v)
	;
};
