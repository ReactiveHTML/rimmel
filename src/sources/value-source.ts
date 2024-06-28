import type { RMLTemplateExpressions } from "../types/internal";

import { pipeIn } from '../utils/input-pipe';

import type { HTMLFieldElement} from "../types/dom";
import { isNumericFieldElement } from "../types/dom";

// /**
//  * An Event Source emitting the "value" of the underlying element instead of an Event object
//  * @param handler A handler function or observer to send events to
//  * @returns EventSource<string>
//  */
// export const InputValue1 = <T extends HTMLFieldElement>(handler: RMLTemplateExpressions.SourceExpression<number | string>) => ({
//     bubbles: false,
//     source: (e: Event) => {
//         const t = (<T>e.target);
//         const v = t?.value;
//         // Always emit a number for numeric fields, not a string
//         return isNumericFieldElement(<Element>t) ? +v : v;
//     },
//     handler,
// });
// 
// 
// export const InputValue = <T extends HTMLFieldElement>(handler: RMLTemplateExpressions.SourceExpression<number | string>) => (e: Event) => {
//         const t = (<T>e.target);
//         const v = t?.value;
//         // Always emit a number for numeric fields, not a string
//         handler( isNumericFieldElement(<Element>t) ? +v : v );
//     }
// ;

/**
 * An Event Source emitting the value of the underlying <input> element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const Value = <T extends HTMLInputElement>(target: RMLTemplateExpressions.SourceExpression<string>) => {
	const nextFn = target?.next?.bind(target) ?? target?.then?.bind(target) ?? target;
	const listener = function(e: Event) {
		const v = this.value;
		nextFn(v);
	};

	return listener;
}

/**
 * An Event Source emitting the numeric value of the underlying <input type="number"> or <input type="range"> element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const ValueAsNumber2 = <T extends HTMLInputElement>(target: RMLTemplateExpressions.SourceExpression<string>) => {
	const nextFn = target?.next?.bind(target) ?? target?.then?.bind(target) ?? target;
	const listener = function(e: Event) {
		const v = this.value;
		nextFn(v);
	};

	return listener;
}


export const Slow = (target: Observer<Coords>) =>
	pipeIn(target, throttleTime(1000))
;


/**
 * An Event Source emitting the numeric value of the underlying <input type="number"> or <input type="range"> element instead of a regular DOM Event object
 * @param handler A handler function or observer to send events to
 * @returns EventSource<string>
 */
export const ValueAsNumber = <T extends HTMLInputElement>(target: RMLTemplateExpressions.SourceExpression<string>) =>
	pipeIn(target, map(function(e: Event) {
		return this.value
	}))
;

