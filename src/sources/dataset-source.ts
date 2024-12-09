import type { RMLTemplateExpressions } from "../types/internal";
import { EventListenerFunction } from "../types/dom";
import type { Observer } from "../types/futures";

import { map } from 'rxjs';
import { inputPipe } from '../utils/input-pipe';
import { Source } from "../types/source";
import { curry } from "../utils/curry";

/**
 * An Event Source Operator emitting any dataset value from the underlying element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, string>
 * @example <button data-foo="bar" onclick="${source(dataset('foo'), stream)}"> ... </button>
**/
export const dataset = <E extends Event>(key: string) =>
	map((e: E) => ((<HTMLElement>e.target).dataset[key]));

/**
 * An Event Source emitting any dataset value from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 * @example <button data-foo="bar" onclick="${Dataset('foo', stream)}"> ... </button>
 * @example <button data-foo="bar" onclick="${Dataset('foo', handlerFn)}"> ... </button>
**/
export const Dataset =
	<T extends HTMLElement, I extends Event, O extends string | undefined>
	(key: string, source?: RMLTemplateExpressions.SourceExpression<I | O>) =>
		curry<I, string | undefined>(dataset(key), source)
;

/**
 * An Event Source Operator emitting the full dataset object from the underlying element instead of a regular DOM Event object
 * @returns OperatorFunction<Event, DOMStringMap>
 * @example <button data-foo="bar" data-baz="bat" onclick="${source(datasetObject, stream)}"> ... </button>
**/
export const datasetObject = map((e: Event) => ((<HTMLElement>e.target).dataset));

/**
 * An Event Source emitting the full dataset object from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 * @example <button data-foo="bar" data-baz="bat" onclick="${DatasetObject(stream)}"> ... </button>
 * @example <button data-foo="bar" data-baz="bat" onclick="${DatasetObject(handlerFn)}"> ... </button>
**/
export const DatasetObject =
	<T extends HTMLElement, I extends Event, O extends string | undefined>
	(source?: RMLTemplateExpressions.SourceExpression<I | O>) =>
		curry<I, DOMStringMap>(datasetObject, source)
;
