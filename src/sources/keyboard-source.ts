import type { RMLTemplateExpressions } from "../types/internal";
import type { char } from "../types/basic";

/**
 * An Event Source emitting the "[event.clientX, event.clientY]" mouse coordinates
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Key = <T extends Element>(target: RMLTemplateExpressions.SourceExpression<char>) => {
	const nextFn = target?.next?.bind(target) ?? target?.then?.bind(target) ?? target;
	return (e: KeyboardEvent) => {
		nextFn(e.data);
	};
};


