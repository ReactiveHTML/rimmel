//import { render } from '../../dist/rimmel.es.js';
import { render } from '../../src/index.js';

function* counter() {
	let initial = 0
	while(true) {
		yield ++initial
	}
}

document.body.innerHTML = render`
	<button type="button" onclick="${counter}"> Click me </button>
	You clicked the button <span>${counter}</span> times.
`;

