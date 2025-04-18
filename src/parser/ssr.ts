import { isSinkBindingConfiguration, type RMLTemplateExpression } from '../types/internal';
import type { HTMLString } from '../types/dom';
import type { SinkBindingConfiguration } from '../types/internal';

import { rml as parser } from '../parser/parser';
import { waitingElementHanlders } from '../internal-state';
import { HydrationScript } from '../ssr/hydration';

import { Observable, endWith, filter, map, mergeAll, mergeWith, tap, from, of, isObservable } from 'rxjs';

let count = 0;
export const rml = (strings: TemplateStringsArray, ...args: RMLTemplateExpression[]): Observable<HTMLString> => {
	const hydrationCall = (data: string) => <HTMLString>`\n<script>Rimmel_Hydrate(${data});</script>`;
	const str: HTMLString = <HTMLString>(parser(strings, ...args) + HydrationScript);
	const tasks = [...waitingElementHanlders.entries()]
		.flatMap(([key, jobs]) =>
			jobs.map(job => {
				if(isSinkBindingConfiguration(job)) {
					const sb = job as SinkBindingConfiguration<any>;
					const source$ =
						isObservable(sb.source)
							? sb.source
							: from(sb.source as Promise<any>)
					;

					return source$.pipe(
						// tap(data=>console.log('EMIT:', data)),
						map(res => [key, {
							resolved: 'ssr',
							...sb,
							// handler: sb.handler,
							value: res,
							sink: job.t,
							count: (count++),
						}])
					);
				} else {
					// TODO: Transpile sources to RPC calls?
					return null;
				}
			})
			.filter(x=>x)
		)
	;

	const asyncStuff = () => from(tasks).pipe(
		filter(task => task !== null),
		mergeAll(),
		map(x => hydrationCall(JSON.stringify(x)))
	);

	// TODO: just return a string here and pass asynquences separately
	return of(str).pipe(
		mergeWith(asyncStuff()),
		endWith(<HTMLString>'\n<!-- hydration end -->\n</body>\n</html>'),
		tap(() => waitingElementHanlders.clear()),
	);
};
