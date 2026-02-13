import { Future, Present } from "../types/futures";
import { isFutureSinkAttributeValue } from "../types/internal";
import { KVP } from "../types/key-value-pair";

/**
 * A Chronosympton is an object whose values can be either present or future.
 * E.G.: { 'data-static': 'value', 'data-dynamic': Promise.resolve('value') }
 */
export type Chronosympton = Record<string, Present<any> | Future<any>>;

type Collapser = (kv: KVP) => boolean;

/**
 * Split a Chronosympton into separate present and future object entries
 * @param expression the Chronosympton to split
 * @param collapse a function that returns true for future entries, false for present ones
 * @returns a tuple of two arrays: the first with present entries, the second with future entries
 * @example
 * const collapse = ([, v]: KVP) => v instanceof Promise || (typeof v === 'object' && 'subscribe' in v && typeof v.subscribe === 'function');
 * const [presentEntries, futureEntries] = chronolize({
 *  'data-static': 'value',
 *  'data-dynamic': Promise.resolve('value')
 * }, collapse)
 */
export const chronolize = (expression: Chronosympton, collapse: Collapser) => {
	const initial = [
		[] as [string, Present<any>][],
		([] as [string,  Future<any>][]).concat(isFutureSinkAttributeValue(expression) ? [['class', expression]] as Future<any> : [] as Future<any>[]),
	];

	const r = Object.entries(expression)
		.reduce((acc, [k, v]) => (acc[+collapse([k, v])].push([k, v]), acc), initial)
	;

	return r;
};
