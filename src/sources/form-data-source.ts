import { inputPipe } from '../utils/input-pipe';
import { map, tap } from 'rxjs';

/**
 * An Event Operator emitting a FormData object from the underlying form element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, FormData>
 * @example <form onsubmit="${source(isValid, form, stream)}"> ... </form>
**/
export const form = map((e: Event) => Object.fromEntries(new FormData(<HTMLFormElement>e.currentTarget)));

/**
 * An Event Adapter emitting a FormData object from the underlying form element instead of a regular DOM Event object
 * @returns EventSource<string>
 * @example <form action="dialog" onsubmit="${Form(stream)}"> ... </form>
 * @example <form action="dialog" onsubmit="${Form(handlerFn)}"> ... </form>
**/
export const Form = inputPipe<SubmitEvent | Event>(
	form,
);
