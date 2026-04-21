import { RMLEventName } from "../../types/dom";
import { SourceBindingConfiguration, RMLTemplateExpressions } from '../../types/internal';
import { callable } from '../../lib/drain';

/**
 * Forces an event listener to be captive (able to capture events bubbling up from child elements before their own event listeners are called)
 *
 * @experimental
 * @example target.innerHTML = rml`
 * <ul onclick="${Captive( handler )}">
 *   <li onclick="${specificHandler}">item</li>
 * </ul>
 * `;
 */
export const Captive =
  <E extends RMLEventName, T>
  (listener: RMLTemplateExpressions.SourceExpression<T>) =>
    ({ type: 'source', listener: callable(listener), options: { capture: true } }) as SourceBindingConfiguration<E>;
;

