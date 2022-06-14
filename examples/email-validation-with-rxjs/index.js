import { render } from '../../dist/rimmel.es.js';
import TextInput from './textInput.js';
const { BehaviorSubject, Subject } = rxjs;
const { map } = rxjs.operators

const disabled = new BehaviorSubject({ disabled: 'disabled' });

const valid = (new Subject()).pipe(
	map(value => ({ disabled: value || undefined }))
)

document.body.innerHTML = render`
	<div class="subscribe">
		${TextInput(valid)}
		<button type="button" ${valid}>
			Subscribe
		</button>
	</div>
`;
