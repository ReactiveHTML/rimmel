import type { Observable } from 'rxjs';

import { Subject } from 'rxjs';
import { MockElement, MockEvent } from '../test-support';
import { Value, value, ValueAsNumber, valueAsNumber } from './value-source';

describe('Value Event Adapter', () => {

	it('Emits the value of the source element into a target', () => {
		const value = 'hello';

		const el = MockElement({
			tagName: 'INPUT',
			type: 'text',
			value,
		});

		const eventData = MockEvent('input', {
			target: el as HTMLInputElement
		});

		const handlerSpy = jest.fn();
		const source = Value(handlerSpy);
		source.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(value);
	});

	it('Emits the numeric value of the source element into a target', () => {
		const value = '12345';

		const el = MockElement({
			tagName: 'INPUT',
			type: 'number',
			valueAsNumber: Number(value),
		});

		const eventData = MockEvent('input', {
			target: el as HTMLInputElement
		});

		const handlerSpy = jest.fn();
		const source = ValueAsNumber(handlerSpy);
		source.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(Number(value));
	});


});


describe('value Event Adapter Operator', () => {

	it('Emits the value of the source element into a target', () => {
		const v = 'world';
		const el = MockElement({
			tagName: 'INPUT',
			type: 'text',
			value: v,
		});

		const eventData = MockEvent('input', {
			target: el as HTMLInputElement
		});

		const handlerSpy = jest.fn();
		const pipeline = new Subject<typeof eventData>().pipe(value) as Observable<typeof v> & Subject<typeof eventData>;
		pipeline.subscribe(x=>handlerSpy(x));
		pipeline.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(v);
	});

});

