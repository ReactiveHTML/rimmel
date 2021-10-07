import { render } from '../../dist/rxhtml.es.js';

const subj = new EventEmitter()

const state = new Proxy({},
	set(target, prop, value, receiver){
		target[prop] = value
		subj.emit(prop, value)
		return true
	}
);

const state2 = new Proxy(state,
	get(target, prop, receiver) {
		const handler = val => val
		subj.on(prop, handler)
		// off(....)
		return handler
	},
);

setInterval(() => {
	const date = new Date();

	state.hours = date.getHours()
	state.minutes = date.getHours()
	state.seconds = date.getHours()

	alert(state.hours)

}, 1000);

document.body.innerHTML = render`
  <div class="clock">
	 <span class="hours">${state.hours}</span>
	 <span class="mins">${state.mins}</span>
	 <span class="secs">${state.secs}</span>
  </div>
`;
