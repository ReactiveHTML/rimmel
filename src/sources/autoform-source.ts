import type { HTMLFieldElement } from '../types/dom';

import { inputPipe } from '../utils/input-pipe';
import { map } from 'rxjs';

const DataMappers = {
	text: (x: string) => x,
	number: (x: string) => Number(x),
	date: (x: string) => new Date(x),
} as const;

const ElementMappers = {
	text: (e: HTMLInputElement) => e.value,
	number: (e: HTMLInputElement) => e.valueAsNumber,
	date: (e: HTMLInputElement) => e.valueAsDate,
	checkbox: (e: HTMLInputElement) => e.checked,
	radio: (e: HTMLInputElement) => e.checked && (DataMappers[e.dataset.type as keyof typeof DataMappers]?.(e.value)??e.value) || undefined,
	'select-one': (e: HTMLSelectElement) => DataMappers[(e.options[e.selectedIndex].dataset.type ?? e.dataset.type) as keyof typeof DataMappers]?.(e.value) ?? e.value,
    'select-multiple': (e: HTMLSelectElement) => [...e.options].filter(o => o.selected).map(o => (DataMappers[o.dataset.type as keyof typeof DataMappers ?? e.dataset.type as keyof typeof DataMappers] ?? DataMappers.text)(o.value)),
} as const;

const resolve = (e: HTMLFieldElement) => (ElementMappers[(e.type ?? (e as HTMLFieldElement).dataset.type) as keyof typeof ElementMappers] ?? ElementMappers.text)(e as HTMLInputElement & HTMLSelectElement);

/**
 * An Event Operator emitting a FormData object from the underlying form element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, FormData>
 * @example <form onsubmit="${source(isValid, form, stream)}"> ... </form>
**/
export const autoForm = map((e: Event) => Object.fromEntries(
	[...(<HTMLFormElement>e.currentTarget).elements]
		.map((e: Element) => [(e as HTMLFieldElement).name ?? e.id, resolve(e as HTMLFieldElement)])
		.filter(([k, v]) => k!=='' && v!==undefined)
));

/**
 * An Event Adapter emitting a FormData object from the underlying form element instead of a regular DOM Event object
 * @returns EventSource<string>
 * @example <form action="dialog" onsubmit="${Form(stream)}"> ... </form>
 * @example <form action="dialog" onsubmit="${Form(handlerFn)}"> ... </form>
**/
export const AutoForm = inputPipe<SubmitEvent | Event>(
	autoForm,
);
