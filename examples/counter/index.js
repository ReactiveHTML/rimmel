import { render } from '../../dist/rimmel.es.js';
const { interval } = rxjs;
const { scan, startWith } = rxjs.operators;

const counter = interval(1000)
	.pipe(
		startWith(0),
		scan(x=>x+1),
	)

document.body.innerHTML = render`
  <h1>A counter that updates every second</h1>
  <div>${counter}</div>
`;

