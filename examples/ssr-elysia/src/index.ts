import { Elysia } from 'elysia';

import { rimmel } from './ssr/rimmel';

import { layout } from './layout';
import { homeRoute } from './routes/home';


export const app = new Elysia({ name: 'rimmel-showcase' })
	.use(rimmel(layout))
	.listen(3001)
;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
