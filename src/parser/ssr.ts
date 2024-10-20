import type { RMLTemplateExpression } from '../types/internal';
import type { HTMLString } from '../types/dom';
import type { SinkBindingConfiguration} from '../types/internal';

import { rml as parser } from '../parser/parser';
import { waitingElementHanlders } from '../internal-state';
import { endWith, map, mergeAll, mergeWith, tap } from 'rxjs/operators';

import { from, Observable, of } from 'rxjs';

let count = 0;

const hydrateFunction = `
<script>
	const resolvables = new Map([...document.querySelectorAll('[RESOLVE]')].map(n=>[n.getAttribute('resolve'), n]));

	const no_sink = (name) => (node, data) => console.error(\`[Rimmel]: called unknown hydration sink "\${name}"\`);
	const sinks = {
		Attribute: (node, data) => Object.entries(data).forEach(([k, v]) => {
			k == 'class' ? node.classList.add(v) : node[k] = v;
		}),
		InnerHTML: (node, data) => node.innerHTML = data,
		AppendHTML: (node, data) => node.inertAdjacentHTML('beforeend', data),
		class: (node, data) => Object.entries(data).forEach(([k, v]) => node.classList.toggle(k, v)),
		Style: (node, data) => Object.entries(data).forEach(([k, v]) => node.style[k] = v),
		StyleObject: (node, data) => Object.entries(data).forEach(([k, v]) => node.style[k] = v),
	};

	function Rimmel_Hydrate(data) {
		const [key, conf] = data;
		const node = resolvables.get(key);
		console.log('SINK type', conf.t, conf.value);
		(sinks[conf.t] ?? no_sink(conf.sink))(node, conf.value);
	}
</script>
`;

export const rml = (strings: TemplateStringsArray, ...args: RMLTemplateExpression[]): Observable<HTMLString> => {
	const hydrationCall = (data: string) => <HTMLString>`\n<script>Rimmel_Hydrate(${data});</script>`;

	const str: HTMLString = <HTMLString>(parser(strings, ...args) +hydrateFunction);

	const tasks = [...waitingElementHanlders.entries()]
		.flatMap(([key, jobs]) =>
			 jobs.map(async (job: SinkBindingConfiguration<Element> | any) => {

				 const res = await job.source;
				 // console.log('>>> JOB', res);
				 return [
					 key,
					 {
						 resolved: 'ssr',
						 ...job,
						 handler: await job.handler,
						 value: res,
						 sink: job.t,
						 count: (count++),
					 }
				 ]
			 })
			 .map(p => from(p))
		)
	;

	const asyncStuff = () => of(...tasks).pipe(
		mergeAll(),
		// tap(x => console.log('>>>', x)),
		map(x => hydrationCall(JSON.stringify(x)))
	);

	return of(str).pipe(
		mergeWith(asyncStuff()),
		endWith(<HTMLString>'\n<!-- streams end -->\n</body>\n</html>'),
		tap(() => waitingElementHanlders.clear()),
	);
};

