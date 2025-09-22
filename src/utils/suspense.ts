import type { Observable } from 'rxjs';

import { BehaviorSubject } from 'rxjs';

/**
 * Observable Suspence Sink — renders an initial value synchronously, then emits subsequent values of the given stream as normal
 * @param initial 
 * @param subsequent 
 * @returns 
 */
export default function Suspense<T>(initial: T, subsequent: Observable<T>): Observable<T> {
	const current = new BehaviorSubject(initial);
	// TODO: store a reference for unsubscription?
	subsequent.subscribe(current);
	return current;
};

// export default function Suspense<T>(initial: T, subsequent: Observable<T>): Observable<T> {
//     return new Observable((observer) => {
//         observer.next(initial);
//         subsequent.subscribe(observer);
//     });
// };

// /**
//  * 
//  * @param initial 
//  * @param subsequent 
//  * @returns 
//  */
// export const default2 = Suspense<T>(initial: T, subsequent: Observable<T>): Observable<T> {
//     subsequent.pipe(
//         startWith(initial)
//     )
// };
