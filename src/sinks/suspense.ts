import type { Observable } from 'rxjs';

import { BehaviorSubject, mergeWith } from 'rxjs';

export const Suspense = <T>(source: Observable<T>, initial: T) => {
    const s2 = new BehaviorSubject<T>(initial).pipe(
        mergeWith(source)
    );
    return s2;
};
