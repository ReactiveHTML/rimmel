import { rimmel } from './ssr/rimmel';

import { layout } from './layout';

// export const app = new Elysia({ name: 'rimmel-showcase' })
// 	.use(rimmel(layout))

// 	.listen(3001)
// ;

const server = Bun.serve({
	port: 3001,
	// routes: {
	// },
	fetch(req: Request) {
		// TODO: so we can abort everything async internally
		// const renderer = rimmel(signal);
		// renderer(app);

		return rimmel(req, layout);
	}
});

console.log(
  `🦊 Bun+Rimmel are running at ${server.hostname}:${server.port}`
);
