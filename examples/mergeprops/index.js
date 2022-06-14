// import { render } from '../../dist/rimmel.es.js';
import { render } from '../../src/index.js';

const { timer } = rxjs;
const { scan } = rxjs.operators


const obs1 = timer(resolve => {
	setTimeout(() => {
		resolve({
			onclick: () => alert(1234),
			disabled: undefined,
			'class': 'red',
		})
	}, 4000)
})


const prom1 = new Promise(resolve => {
	setTimeout(() => {
		resolve({
			onclick: () => alert(1234),
			disabled: undefined,
			'class': 'red',
		})
	}, 3000)
})

const obj = {
	onclick: () => alert(1234),
	disabled: 'disabled',
}

setTimeout(() => {
	document.body.innerHTML = render`
		<button id="btn1" disabled="disabled" ...${prom1} ...${obs1}> Click me </button>
	`;
}, 2000)


