import type { Future, Present } from "../types/futures";
import type { KVP } from "../types/key-value-pair";
import type { Entries } from "../types/object-entries";

/**
 * An object containing both present and future (Promise or Observable) values.
 * @example
 * const c = {
 *  key1: 'present',
 *  key2: Promise.resolve('future'),
 *  key3: Observable.from(['many', 'futures']),
 * }
 */
export interface Chronosympton {
	[key: string]: Present<any> | Future<any> | Chronosympton;
}
/**
 * A function used to tell "collapse" a present from a future value, in relation
 * to whether it's to be baked in static HTML code or bound after mounting
 */
type Collapser = (kv: KVP) => boolean;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	value !== null &&
	typeof value === "object" &&
	!Array.isArray(value)
;

/**
 * Split a {@link Chronosympton} into separate present and future object entries
 * @param obj the Chronosympton to split
 * @param collapse a function that returns true for future entries, false for present ones
 * @returns a tuple of two arrays: the first with present entries, the second with future entries
 * @example
 * const collapse = ([, v]: KVP) => v instanceof Promise || (typeof v === 'object' && 'subscribe' in v && typeof v.subscribe === 'function');
 * const [presentEntries, futureEntries] = chronolyze(obj, collapse)
 */
export const chronolyze = (obj: Chronosympton, collapse: Collapser): [Entries<Present<any>>, Entries<Future<any>>] => {
	const presents: Entries<Present<any>> = [];
	const futures: Entries<Future<any>> = [];

	for(const key in obj) {
		if(!Object.prototype.hasOwnProperty.call(obj, key))
			continue;

		const value = obj[key];
		const kv: KVP = [key, value];

		if(collapse(kv)) {
			futures.push([key, value as Future<any>]);
			continue;
		}

		if(isRecord(value)) {
			const [nestedPresent, nestedFuture] = chronolyze(value as Chronosympton, collapse);

			if (nestedPresent.length) {
				presents.push([key, Object.fromEntries(nestedPresent) as Present<any>]);
			}

			if(nestedFuture.length) {
				futures.push([key, Object.fromEntries(nestedFuture) as Future<any>]);
			}

			continue;
		}

		presents.push([key, value as Present<any>]);
	}

	return [presents, futures];
};

