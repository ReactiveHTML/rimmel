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
        const no_sink = (name) => (key, data) => console.error('[Rimmel]: called unknown hydration sink "\${name}"'),
        sinks = {
            InnerHTML: (key, data) => document.querySelector(\`[RESOLVE="\${key}"]\`).innerHTML = data,
            AppendHTML: (key, data) => document.querySelector(\`[RESOLVE="\${key}"]\`).innerHTML += data,
            Style: (key, data) => Object.entries(data).forEach(([k, v]) => {
                document.querySelector(\`[RESOLVE="\${key}"]\`).style[k] = v;
            }),
            Class: (key, data) => Object.entries(data).forEach(([k, v]) => {
                document.querySelector(\`[RESOLVE="\${key}"]\`).classList.toggle(k, v);
            }),
        };
        Rimmel_Hydrate = (data) => {
            const [key, handler] = data;
            console.log('SINK type', handler.t, handler.value);
            (sinks[handler.t] ?? no_sink(handler.sink))(key, handler.value);
        }
    </script>
`;

export const rml = (strings: TemplateStringsArray, ...args: RMLTemplateExpression[]): Observable<HTMLString> => {
    debugger;
    const hydrationCall = (data: string) => <HTMLString>`\n<script>Rimmel_Hydrate(${data});</script>`;

    const str: HTMLString = <HTMLString>(parser(strings, ...args) +hydrateFunction);

    const tasks = [...waitingElementHanlders.entries()]
        .flatMap(([key, jobs]) =>
            jobs.map(async (job: SinkBindingConfiguration<Element> | any) => {

              const res = await job.source;
              console.log('>>> JOB', res);
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
        tap(x => console.log('>>>', JSON.stringify(x))),
        map(x => hydrationCall(JSON.stringify(x)))
    );

    return of(str).pipe(
        mergeWith(asyncStuff()),
        endWith(<HTMLString>'\n<!-- streams end -->\n</body>\n</html>'),
        tap(() => waitingElementHanlders.clear()),
    );
};

