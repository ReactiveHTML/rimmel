import { Sink } from "../types/sink";

/**
 * An explicit sink that sets the .value of an HTML input element
 *
 * @param Element node - The HTML Input element to change the value for
 * @returns Function A function that takes a value and sets it as the element's .value
 **/
export const ValueSink: Sink<HTMLInputElement> =
	(node: HTMLInputElement) =>
		(str: string) => {
			node.value = str;
		}
;
