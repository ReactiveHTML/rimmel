import { isSinkBindingConfiguration, type RMLTemplateExpression } from '../types/internal';
import type { HTMLString } from '../types/dom';
import type { SinkBindingConfiguration } from '../types/internal';

import { rml as parser } from '../parser/parser';
import { waitingElementHandlers } from '../internal-state';
import { HydrationScript } from '../ssr/hydration';

import { Observable, endWith, filter, map, mergeAll, mergeWith, tap, from, of, isObservable, OperatorFunction } from 'rxjs';

const sanitizeScriptEnd = (str: HTMLString) => str.replace(/<\/script>/g, '<\\\/script>');

export const renderer = (req: Request) => {
	let count = 0; // this just for debugging?

	const rml = (strings: TemplateStringsArray, ...args: RMLTemplateExpression[]): Observable<HTMLString> => {
		const hydrationCall = (data: string | HTMLString) => <HTMLString>`\n<script>Rimmel_Hydrate(${sanitizeScriptEnd(data as HTMLString)});</script>`;

		const str: HTMLString = <HTMLString>(parser(strings, ...args) + HydrationScript);

		const tasks = [...waitingElementHandlers.entries()]
			.flatMap(([key, jobs]) =>
				jobs.map(job => {
					if(isSinkBindingConfiguration(job)) {
						const sb = job as SinkBindingConfiguration<any>;
						const source =
							isObservable(sb.source)
								? sb.source
								: from(sb.source as Promise<any>)
						;

						return source.pipe(
							// tap(data=>console.log('EMIT:', data)),
							map(res => [key, {
								resolved: 'ssr',
								...sb,
								// handler: sb.handler,
								value: res,
								source: undefined,
								sink: job.t,
								count: (count++),
							}])
						);
					} else {
						// Source Binding

						// TODO: Transpile sources to RPC calls?
						// If we can identify a stream as pure, we can send it to the client and bind it E2E
						// Same if it's impure with front-end effects.
						// Should be kept here and perhaps exposed with some RPC if it's impure with server effects
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

		// TODO:
		// req.signal?.addEventListener('abort', () => {
		//	// unsubscribe/abort everything?
		// });

		// TODO: just return a string here and pass asynquences separately
		const unclosedHTML = str.replace(/<\/body>.*<\/html>\s*$/, '') as HTMLString;

		return of(unclosedHTML).pipe(
			mergeWith(asyncStuff()),
			endWith('\n<!-- hydration end -->\n</body>\n</html>' as HTMLString),
			tap(() => waitingElementHandlers.clear()),
		);
	};

	return rml;
};

// Can we rewire every {rml} import from various components on the server?
export const rml = (strings: TemplateStringsArray, ...args: RMLTemplateExpression[]) => {
	const str = parser(strings, ...args) as HTMLString;

	return str;
};
