import type { RMLTemplateExpressions } from "../types/internal";

/**
 * An Event Source emitting any dataset value from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const ___Dataset = <T extends HTMLElement>(target: RMLTemplateExpressions.SourceExpression<string>, key: string) =>
	(nextFn: (data: string) => void) =>
		(e: Event) => {
			const t = (<T>e.target);
			const v = t.dataset[key];
			target(v);
		};

/**
 * An Event Source emitting any dataset value from the underlying element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Dataset = <T extends HTMLElement>(target: RMLTemplateExpressions.SourceExpression<string>, key: string) => {
	const nextFn = target?.next?.bind(target) ?? target?.then?.bind(target) ?? target;
	const listener = function(e: Event) {
		const v = this.dataset[key];
		nextFn(v);
	};

	return listener;
}

export const Numberset = <T extends HTMLElement>(target: RMLTemplateExpressions.SourceExpression<string>, key: string) => {
	const nextFn = target?.next?.bind(target) ?? target?.then?.bind(target) ?? target;
	const listener = function(e: Event) {
		const v = Number(this.dataset[key]);
		nextFn(v);
	};

	return listener;

//	return {
//		type: 'source',
//		source,
//		listener,
//	};
}

// <button data-foo="bar" onclick="${Dataset(stream, 'foo')}"> ... </button>
// <button data-foo="bar" onclick="${Dataset(handlerFn, 'foo')}"> ... </button>
// <button data-foo="bar" onclick="${Dataset(resolveFn, 'foo')}"> ... </button>
// <button data-foo="bar" onclick="${Dataset(rejectFn, 'foo')}"> ... </button>

