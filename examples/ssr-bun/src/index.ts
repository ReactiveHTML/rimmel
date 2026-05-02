import { rimmel } from './ssr/rimmel';

import { layout } from './layout';

const server = Bun.serve({
	port: 3001,
	fetch(req: Request) {
		return rimmel(req, layout);
	}
});

console.log(
  `🐇 Bun+Rimmel are running on ${server.hostname}:${server.port}`
);
