import { type Observable, withLatestFrom, map, of, pipe, from } from "rxjs";
import type { MaybeFuture, Observer, Present } from "../types/futures";
import { curry } from "../utils/curry";

const maybeLift = <T>(v: MaybeFuture<T>): Observable<T> =>
	(v as Observable<T>).subscribe ? v as Observable<T> :
	(v as Promise<T>).then ? from(v as Promise<T>) :
	of(v as Present<T>)
;

/**
 * WIP: don't use yet
 * Emits the latest value coming from the supplied observable
 */
export const AsLatestFrom = <I, O>(source: MaybeFuture<I>, target?: Observer<O>) =>
	curry<I, I>(
		pipe(
			withLatestFrom(maybeLift(source)),
			map(([_, source]) => source),
		),
		target
	)
;
