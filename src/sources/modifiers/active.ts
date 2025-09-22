import { RMLEventName } from "../../types/dom";
import { SourceBindingConfiguration, RMLTemplateExpressions } from '../../types/internal';
import { callable } from '../../lib/drain';

/**
 * Forces an event listener to be active (e.g.: scroll, touchstart)
 *
 * @experimental
 * @example target.innerHTML = rml`
 *   <div onmouseover="${Active( handler )}">...</div>
 * `;
 */
export const Active =
  <E extends RMLEventName, T>
  (listener: RMLTemplateExpressions.SourceExpression<T>) =>
    ({ type: 'source', listener: callable(listener), options: { passive: false } }) as SourceBindingConfiguration<E>;
;

