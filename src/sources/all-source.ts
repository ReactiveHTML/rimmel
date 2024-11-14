//import type { CSSSelector } from '../types/dom';
import type { RMLTemplateExpressions } from '../types/internal';
type CSSSelector = string;
import { map } from 'rxjs';
import { pipeIn } from '../utils/input-pipe';

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const All =
	<T>(qs: CSSSelector | CSSSelector[], target: RMLTemplateExpressions._TargetEventHandler<Element[]>) =>
		pipeIn<Event, Element[]>(target,
			map((e: Event) => {
				const t = <Element>e.currentTarget;
				return (<CSSSelector[]>[]).concat(qs).flatMap(qs=>[...t.querySelectorAll(qs)])
			}),
		);

export const qs =
	(qs: CSSSelector | CSSSelector[]) =>
		map((e: Event) => {
			const t = <Element>e.currentTarget;
			return (<CSSSelector[]>[]).concat(qs).flatMap(qs=>[...t.querySelectorAll(qs)])
		});

