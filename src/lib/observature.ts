/**
 * A Future Subject meant to connect an operator pipeline
 * to an Observable that doesn't exist yet
 * and an Observer that also doesn't exist yet
 * without creating an intermediary Subject (so it'll save an unnecessary step in the pipeline)
 **/
export const CreateObservature = <I, O>(initial?: I) => {
	let sources: Observable[] = [];

	let observer = {
		next: () => {},
		error: () => {},
		complete: () => {},
	};
	const operators = [];
	const output = new Observable(_observer => {
		observer = _observer;
		return {
			unsubscribe: () => {}
		}
	});
	return new Proxy(output, {
		get(target, prop) {
			switch(prop) {

				case 'value':
					return initial;

				case Symbol.for('observable'):
				case '@@observable':
					return function() { return this };

				case '@@Observature':
				case 'Observature':
				case Symbol.for('observature'):
					return true;

				case 'addSource':
					return _source => {
						sources.push(_source);
					}

				case 'type':
					return undefined;

				case 'next':
					return observer.next;

				case 'error':
					return observer.error;

				case 'complete':
					return observer.complete;

				case 'subscribe':
					return (_observer) => {
						observer = _observer;
						const starter = Observable.merge(...[].concat(sources, initial ? Observable.of(initial) : []));
						const pipeline = operators
							.reduce((obs, {prop, args}) => obs[prop](...args), starter)
						pipeline.subscribe(observer);
						if(initial !== undefined) {
							observer.next(initial);
						}
					}

				default:
					if(Observable.prototype.hasOwnProperty(prop)) {
						// Any Observable method
						return function(...args) {
							operators.push({prop, args});
							return this;
						}
					} else {
						// Anything left to handle?
						return target[prop];
					}
			};
		}
	});
};

export class Observature {
	constructor(...args) {
		return CreateObservature(...args);
	}
}

