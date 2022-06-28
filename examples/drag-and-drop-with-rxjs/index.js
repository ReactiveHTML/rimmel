import {Draggable} from './draggable.js'
import {render} from '../../src/index.js'

function App() {
	const Playground = () => render`
		<div class="playground">
			<div ...${Draggable()}>${'Drag Me'}</div>
		</div>
	`

	document.body.innerHTML = render`
		<h1>Drag'n'drop example</h1>

		${Playground()}
	`
}

onload = App

