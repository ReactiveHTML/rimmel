import type { BehaviorSubject } from "../types/futures";

/**
 * Get the current value from the given object if it's a BehaviorSubject, otherwise undefined
 */
export const currentValue = <T>(stream: BehaviorSubject<T> | unknown): T | undefined =>
	// FIXME: this relies on a piped BehaviorSubject exposing source and destination, which might not be supported in future releases
	(stream as BehaviorSubject<T>)?.value ?? ((stream as BehaviorSubject<T>)?.destination ? currentValue((stream as BehaviorSubject<T>)?.destination) : undefined);
	// ?? ((<RMLTemplateExpressions.SourceExpression<any>>expression).source && takeFirstSync((<Observable<any>>expression).source))
	// ?? takeFirstSync(expression)
;
