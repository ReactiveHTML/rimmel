import { inputPipe } from '../utils/input-pipe';
import { map, tap } from 'rxjs';

/**
 * An Event Source emitting a FormData object from the underlying form element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 * @example <button data-foo="bar" onclick="${Dataset(stream, 'foo')}"> ... </button>
 * @example <button data-foo="bar" onclick="${Dataset(handlerFn, 'foo')}"> ... </button>
 * @example <button data-foo="bar" onclick="${Dataset(resolveFn, 'foo')}"> ... </button>
 * @example <button data-foo="bar" onclick="${Dataset(rejectFn, 'foo')}"> ... </button>
**/
export const Form = inputPipe<SubmitEvent | FormDataEvent>(
	tap(e => e.preventDefault()),
    map((e: FormDataEvent) => Object.fromEntries(new FormData(<HTMLFormElement>e.target))),
);
