import type { Sink } from "../types/sink";

export const READ_ONLY_SINK_TAG = 'readonly';

/**
 * A specialised sink for the "readonly" HTML attribute
 * @param source A present or future boolean value
 * @returns RMLTemplateExpression A template expression for the "readonly" attribute
 * @example <input type="button" readonly="${booleanValue}">
 * @example <input type="button" readonly="${booleanPromise}">
 * @example <input type="button" readonly="${booleanObservable}">
 */
export const ReadonlySink: Sink<HTMLInputElement> = (node: HTMLInputElement) =>
	(value: boolean) => {
		node.readOnly = value;
	};
;

