// import { Elysia } from 'elysia';
import { rml } from '../../../../../src/ssr';
// import { ClickCounter } from '../../app/components/click-counter';
import { Delay } from '../../app/components/delay';

export const homeRoute = () => rml`
	<main>
	  <h1>Welcome home</h1>
		<div>${Delay(5000, 'delayed data')}</div>
	</main>
`;
