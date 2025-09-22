import { catchError, of } from 'rxjs';
import type { HTMLString } from '../types/dom';
import { MaybeFuture } from '../types/futures';

/**
 * An error-catcher sink that displays a custom message when the underlying stream errors
 * @param stream The original data or source stream
 * @param handler A function that takes an error and returns a message
 * @returns RMLTemplateExpression A template expression for the "innerHTML" attribute
 * @example <div>${Catch(contentStream)}">
 * @example <input value="${Catch(valueStream)}">
 */
export const Catch = (stream: MaybeFuture<any>, handler: (e: Error) => HTMLString | string | number) =>
	(stream.pipe?.(catchError((err: Error) => of(handler(err)))))
	?? (stream.catch?.((err: Error) => handler(err)))
	?? stream
	// ?? handler(stream)
;
