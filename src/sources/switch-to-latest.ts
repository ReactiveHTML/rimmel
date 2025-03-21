import { type Observable, withLatestFrom, map, of, pipe, from } from "rxjs";
import type { MaybeFuture, Present } from "../types/futures";
import { curry } from "../utils/curry";
import { inputPipe } from "../utils/input-pipe";

const maybeLift = <T>(v: MaybeFuture<T>): Observable<T> =>
	(v as Observable<T>).subscribe ? v as Observable<T> :
	(v as Promise<T>).then ? from(v as Promise<T>) :
	of(v as Present<T>)
;

/**
 * WIP: don't use yet
 * Emits the latest value coming from the supplied observable
 */
export const SwitchToLatest = <T>(source: MaybeFuture<T>) =>
	curry<T, T>(
		pipe(
			withLatestFrom(maybeLift(source)),
			map(([_, source]) => source),
		)
	)
;

// /**
//  * WIP: don't use
//  * Emits the latest value coming from the supplied observable
//  */
// export const SwitchTo = <T>(source: Observable<T>) => inputPipe(
//   withLatestFrom(maybeLift(source)),
//   map(([_, source]) => source),
// );

