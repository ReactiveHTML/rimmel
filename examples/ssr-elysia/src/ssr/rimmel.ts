import type { Observable } from 'rxjs';
import type { HTMLString } from '../../../../src/types';
import { Elysia } from 'elysia';
import { isObservableLike } from './is-rml-stream';
import { streamingRender } from './streaming-render';

export const rimmel = (layout: ({ request, content }: { request: Request; content: Observable<HTMLString> }) => Observable<HTMLString>) =>
	new Elysia({ name: 'rimmel-ssr' })

		.onAfterHandle({ as: 'global' }, ({ response, request }) => {
			console.log('#####', layout)
			if (true || typeof layout == 'function') {

				console.log('>>>> LAYOUT');
				debugger;
				try {
					const r = layout({ request });
					console.log('______', r);
					return r;
				} catch(e) {
					console.error('errrrrrrrrrrrr', e);
				}


			} else if (isObservableLike(response)) {
				const r = layout({ request, content: response });
				console.log('LLLLLLLL', r);
				return layout({ request, content: response });
			}
			return response;
		})

		.mapResponse({ as: 'global' }, ({ response, request }) => {
			if (isObservableLike(response)) {
				return new Response(streamingRender(response, request.signal), {
					headers: {
						'content-type': 'text/html; charset=utf-8'
					}
				});
			}
			console.log('@@@@@@@@@@@ NON OBS', response);
			return response;
		})
;