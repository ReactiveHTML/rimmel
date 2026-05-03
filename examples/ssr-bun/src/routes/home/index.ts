import { rml } from '../../../../../src/ssr';
import { AutoInc } from '../../app/components/autoinc';
import { ClickCounter } from '../../app/components/click-counter';
import { Delay } from '../../app/components/delay';

import CSS from './home.module.css';

const thing = "test";

export const homeRoute = () => ({
	title: 'Home Page | Rimmel SSR',
	body: rml`
		<main>
			<h1>Welcome home</h1>

			<p>${thing}</p>

			<div>Promise: <span class="${CSS.Waiting}">${Delay(5000, 'delayed promise data')}</span></div>
			<div>${AutoInc(5)}</div>

			<div>${ClickCounter()}</div>
		</main>
	`
});
