import {Draggable} from './draggable.js'
import {render} from '../../src/index.js'

const Classes = new Proxy({}, {
	memo: new Map(),
	scramble: stuff => Math.random(),
	get: function(target, prop, receiver) {
		this.memo.set(prop, this.scramble(prop))
		return prop
	},
})

function App() {
	const Playground = () => render`
		<div class="${Classes.playground}">
			<div ...${Draggable()}>${'Drag Me'}</div>
		</div>
	`

	document.body.innerHTML = render`
		<h1>Drag'n'drop example</h1>

		${Playground()}
	`
}

onload = App

