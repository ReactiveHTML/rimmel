import type { RMLTemplateExpressions } from '../types/internal';
import type { OperatorFunction } from 'rxjs';

import { inputPipe, pipeIn } from '../utils/input-pipe';

/**
 * Curry for input stream operators
 **/
export const curry =
	<I, O>
	(op: OperatorFunction<I, O>, destination?: RMLTemplateExpressions.Any) =>
		destination
			? pipeIn<I, O>(destination, op)
			: inputPipe<I, O>(op)
;
