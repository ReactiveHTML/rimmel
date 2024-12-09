import { map } from "rxjs";
import { autoValue } from '../utils/auto-value';
import { inputPipe } from '../utils/input-pipe';

/**
 * An Event operator that "cuts" the value of the underlying <input> element
 * This operator has side effects, as it will directly modify the underlying element
 * @param target A target function or observer to send events to
 * @returns EventSource<string>
 */
export const cut = 
	map(<T extends (HTMLInputElement | HTMLElement), I extends Event, O extends string | number | Date | null>(e: I): O => {
		const t = (<T>e.target);
		const v = <O>autoValue(t);
		(t as HTMLInputElement).value = '';
		// TODO: t.innerText = '' for contenteditable items?
		return v
	})
;

/**
 * An Event Adapter that "cuts" the value of the underlying <input> element
 * @param target A target function or observer to send events to
 * @returns EventSource<string>
 */
export const Cut =
	inputPipe<Event, string | number | Date | null>(
		cut
	)
;