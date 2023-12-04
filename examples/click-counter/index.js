import { rml } from '../../dist/rimmel.es.js';
const { BehaviorSubject } = rxjs;
const { scan } = rxjs.operators

// a simple observable stream that
// counts anything that passes through it
const counter = (new BehaviorSubject(0)).pipe(
	scan(a=>a+1)
)

document.body.innerHTML = rml`
	<button type="button" onclick="${counter}"> Click me </button>
	You clicked the button <span>${counter}</span> times.
`;

