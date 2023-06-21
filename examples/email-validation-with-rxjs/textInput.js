import { render } from '../../dist/rimmel.es.js';
const { Subject } = rxjs;
const { map, tap } = rxjs.operators

const regex = /^[^@]+@[^@]+\.[^@]+$/;

export default (onValid: Observable<bool>) => {
	const keyStream = new Subject()

	// the following observable takes a KeyboardEvent,
	// tests it through the provided regex for validation
	// emits 
	const isValid = keyStream.pipe(
		map(e => regex.test(e.target.value)),
	)
	
	onValid && isValid.subscribe(onValid)
	
	const colorFeedback = isValid.pipe(
		map(value => ({
			green: value,
			red: !value,
		})),
	)

	return render`
	 <div class="base ${colorFeedback}">
		<input type="email" oninput="${keyStream}" />
	 </div>
  `;
}

