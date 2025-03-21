import type { CSSSelector } from '../types/dom';
import type { RMLTemplateExpressions } from '../types/internal';
import { map } from 'rxjs';
import { pipeIn } from '../utils/input-pipe';

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @param qs A query selector to select nodes from the underlying element's subtree
 * @param target A handler function or observer to send events to
 */
export const All =
	<T>
	(querySelector: CSSSelector | CSSSelector[], target: RMLTemplateExpressions.TargetEventHandler<Element[]>) =>
		pipeIn<Event, Element[]>(target,
			map((e: Event) => (<CSSSelector[]>[]).concat(querySelector)
					.flatMap(querySelector=>[...(e.currentTarget as Element).querySelectorAll(querySelector)])
			),
		)
;

export const qsa = (qs: CSSSelector | CSSSelector[]) =>
	map((e: Event) => {
		const t = <Element>e.currentTarget;
		return (<CSSSelector[]>[]).concat(qs).flatMap(qs=>[...t.querySelectorAll(qs)])
	})
;
