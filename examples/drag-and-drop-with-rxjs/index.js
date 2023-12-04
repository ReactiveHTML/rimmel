import { Draggable } from './draggable.js'
import { rml } from '../../src/index.js'

function App() {
	document.body.innerHTML = rml`
		<h1>Drag'n'drop example</h1>

		<div ...${Draggable()}>${'Drag Me'}</div>
	`
}

onload = App

