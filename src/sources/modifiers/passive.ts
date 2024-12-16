import { RMLEventName } from "../../types/dom";
import { SourceBindingConfiguration, RMLTemplateExpressions } from '../../types/internal';
import { callable } from '../../lib/drain';

/**
 * Forces an event listener to be passive
 *
 * @experimental
 * @example target.innerHTML = rml`
 *   <div onmouseover="${Passive( handler )}">...</div>
 * `;
 */
export const Passive =
  <E extends RMLEventName, T>
  (listener: RMLTemplateExpressions.SourceExpression<T>) =>
    ({ type: 'source', listener: callable(listener), options: { passive: true } }) as SourceBindingConfiguration<E>;
;


