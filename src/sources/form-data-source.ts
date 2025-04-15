import { inputPipe } from '../utils/input-pipe';
import { map } from 'rxjs';

/**
 * An Event Operator emitting a FormData object from the underlying form element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, FormData>
 * @example <form onsubmit="${source(isValid, form, stream)}"> ... </form>
**/
export const form =
	map((e: Event) => {
		if (e.type == 'submit' && (e.target as HTMLFormElement).method != 'dialog') {
			// This is contentious. Should we or sohuld we not call preventDefault() on the event here?
			// If we're using this in a dialog, we probably want it to close
			// On the other hand, if we're using this in a regular form, we probably want to submit it later
			e.preventDefault();
		}

		return Object.fromEntries(new FormData(<HTMLFormElement>e.currentTarget)
			// Checkboxes unintuitively emit "on" vs "null"
			// FIXME: this should become a pipeline plugin, so people can choose their preferred behaviour?
			// .map(([k, v]) => [k, v == 'on' ? true : v == 'null' ? false])
	)})
;

/**
 * An Event Adapter emitting the underlying form's key-values
 * @effect calls preventDefault() on the event
 * @unstable might need to review the preventDefault() behaviour
 * @unstable might need to review the checkbox behaviour (on/off vs true/false)
 * @returns EventSource<string>
 * @example `<form action="dialog" onsubmit="${Form(stream)}"> ... </form>`
 * @example `<form action="dialog" onsubmit="${Form(handlerFn)}"> ... </form>`
 *
 * ## Examples
 * ### Submit a form into a stream
 * 
 * No need to call preventDefault() on the event, as this is done automatically
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const stream = new Subject<FormData>();
 *
 *   return rml`
 *     <form onsubmit="${stream}">
 *	     <input type="text" name="name">
 *	     <input type="email" name="email">
 *     </form>
 *   `;
 * }
 * ```
 * 
 * ### Submit a dialog form into a stream
 * ```ts
 * import { rml } from 'rimmel';
 *
 * const Component = () => {
 *   const stream = new Subject<FormData>();
 *
 *   return rml`
 *     <form onsubmit="${stream}">
 *	     <input type="text" name="name">
 *	     <input type="email" name="email">
 *     </form>
 *   `;
 * }
 * ```

**/
export const Form = inputPipe<SubmitEvent | Event>(
	form,
);

export const asFormData = form;
export const AsFormData = Form;
