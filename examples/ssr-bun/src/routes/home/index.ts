import { rml } from '../../../../../src/ssr';
import { AutoInc } from '../../app/components/autoinc';
import { ClickCounter } from '../../app/components/click-counter';
import { Delay } from '../../app/components/delay';

const thing = "test";

export const homeRoute = () => rml`
	<main>
	  <h1>Welcome home</h1>
		<p>${thing}</p>
		<div>Promise: ${Delay(5000, 'delayed promise data')}</div>
		<div>${ClickCounter()}</div>
		<div>${AutoInc()}</div>
	</main>
`;
