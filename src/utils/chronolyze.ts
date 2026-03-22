import { Future, isFuture, Present } from "../types/futures";
import { isFutureSinkAttributeValue } from "../types/internal";
import { KVP } from "../types/key-value-pair";
import { Entries } from "../types/object-entries";

/**
 * An object containing both present and future (Promise or Observable) values.
 * @example
 * const cs = {
 *  key1: 'present',
 *  key2: Promise.resolve('future'),
 *  key3: Observable.of('future'),
 * }
 */
export type Chronosympton = Record<string, Present<any> | Future<any>>;

/**
 * A function used to tell "collapse" a present from a future value, in relation
 * to whether it's to be baked in static HTML code or bound after mounting
 */
type Collapser = (kv: KVP) => boolean;

/**
 * Split a {@link Chronosympton} into separate present and future object entries
 * @param obj the Chronosympton to split
 * @param collapse a function that returns true for future entries, false for present ones
 * @returns a tuple of two arrays: the first with present entries, the second with future entries
 * @example
 * const collapse = ([, v]: KVP) => v instanceof Promise || (typeof v === 'object' && 'subscribe' in v && typeof v.subscribe === 'function');
 * const [presentEntries, futureEntries] = chronolyze(obj, collapse)
 */
export const chronolyze = (obj: Chronosympton, collapse: Collapser) => {
	const initial = [
		[] as Entries<Present<any>>,
		[] as Entries<Future<any>>, //.concat(isFutureSinkAttributeValue(expression) ? [['class', expression]] as Future<any> : [] as Future<any>[]),
	];

	if(isFuture(obj)) {
		return [[],[obj]];
	} else if(typeof obj != 'object') {
		return [[obj], []];
	} else {
		const r = Object
			.entries(obj ?? {})
			.reduce((acc, [k, v]) => {
				// const [p, f] = collapse([k, v]).map(x=>chronolize(x, collapse));
				if(collapse([k, v])) {
					acc[1].push({[k]: v});
				} else {
					const [p, f] = chronolyze(v, collapse);
					acc[0].push(...p.map(p=>({[k]: p})));
					acc[1].push(...f.map(f=>({[k]: f})));
					// acc[+collapse([k, v])].push([k, v]);
				}
				return acc
			}, initial)
		;

		return r;
	}
};
