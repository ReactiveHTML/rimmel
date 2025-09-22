import type { BehaviorSubject, Observable } from '../types/futures';

export function takeFirstSync<T>(stream: Observable<T>): T | undefined {
	let result: T | undefined = (stream as BehaviorSubject<T>).value;
	result ?? (stream?.subscribe?.(value => result = value)?.unsubscribe?.());
	return result;
}
