import { render } from '../../dist/rxhtml.es.js';
const { Subject } = rxjs;
const { map, tap } = rxjs.operators

const regex = /^[^@]+@[^@]+\.[^@]+$/;

export default (onValid) => {
	const changeEmitter = new Subject()

	const inputClass = changeEmitter.pipe(
		map(e => regex.test(e.target.value)),
		tap(value => onValid.next(!value)),
		map(value => ({
			green: value,
			red: !value,
		})),
	)

	return render`
	 <div class="base ${inputClass}">
		<input type="email" onchange="${changeEmitter}" />
	 </div>
  `;
}
