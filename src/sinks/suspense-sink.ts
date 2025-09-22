import type { Future } from '../types/futures';
import { BehaviorSubject } from 'rxjs';
import { asap } from "../lib/drain";

/**
 * Display a temporary value until an async stream starts emitting
 **/
export const Suspend = <T>(initial: T, source: Future<T>) => {
	const interim = new BehaviorSubject<T>(initial);
	// source.subscribe?.(interim) ?? source.then?.(data=>interim.next(data));
	asap(interim, source);
	return interim;
};

export const Suspender = <T>(initial: T, source?: Future<T>) =>
	source
		? Suspend(initial, source)
		: (source: Future<T>) => Suspend(initial, source);
;
