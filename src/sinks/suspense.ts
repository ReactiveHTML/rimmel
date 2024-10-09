import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export const Suspend = <T>(source: Observable<T>, initial: T) => {
    const interim = new BehaviorSubject<T>(initial);
    source.subscribe(interim);
    return interim;
};
