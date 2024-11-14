import type { Observable } from '../types/futures';

// TODO: add support for sync promises w/ cancellation?
export function takeFirstSync<T>(stream: Observable<T>): T | undefined {
	let result: T | undefined;
	stream?.subscribe?.(value => result = value)?.unsubscribe?.();
	return result;
}
