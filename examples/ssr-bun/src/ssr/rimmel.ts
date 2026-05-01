import { renderer } from '../../../../src/ssr';
import type { RimmelComponent } from '../../../../src/types/internal';

import { streamingRender } from './streaming-render';

export const rimmel = (req: Request, root) => {
	const rml = renderer(req);
	const app = root(rml, req);

	return new Response(streamingRender(app, req), {
		headers: { 'Content-Type': 'text/html' },
	});
};
