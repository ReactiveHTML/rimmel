import type { Observable } from 'rxjs';
import type { MaybeFuture } from '../../../../src/types';

export const isObservableLike = <T = unknown>(value: MaybeFuture<T>): value is Observable<T> => {
	// console.log('isobs?', value);
	// return true;
	// return value.subscribe;
	// return !!value && typeof value === 'object' && 'subscribe' in value;
	return value?.subscribe;
};
