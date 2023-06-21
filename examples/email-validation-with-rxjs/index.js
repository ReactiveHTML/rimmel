import { render } from '../../dist/rimmel.es.js';
import TextInput from './textInput.js';
const { BehaviorSubject } = rxjs;
const { map, startWith, } = rxjs.operators

const validState = (new BehaviorSubject('')).pipe(
	map(value => ({ disabled: value && 'disabled' || undefined })),
	startWith(({ disabled: 'disabled' })),
)

document.body.innerHTML = render`
	<div class="subscribe">
		${TextInput(validState)}

		<button type="button" ...${validState}>
			Subscribe
		</button>
	</div>
`;

