import {Draggable} from './draggable.js'
import {render} from '../../src/index.js'

function App() {
	document.body.innerHTML = render`
		<h1>Drag'n'drop example</h1>

		<div ...${Draggable()}>${'Drag Me'}</div>
	`
}

onload = App

