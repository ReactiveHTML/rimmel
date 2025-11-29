import type { Observable } from 'rxjs';

import { Subject } from 'rxjs';
import { Swap, swap } from './swap-source';
import { MockElement, MockEvent } from '../test-support';
import { Observer } from '../types';

describe('Swap Event Adapter', () => {
	it('Swaps a value from an element with a static string', () => {
		const oldValue = 'old data';
		const newValue = 'new data';
		const el = MockElement({
			tagName: "INPUT",
			type: 'text',
			value: oldValue,
		});
		const eventData = MockEvent('input', {
			target: el as HTMLInputElement
		});
		const handlerSpy = jest.fn();
		const source = Swap(newValue, handlerSpy) as Observer<any>;

		source.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(oldValue);
		expect(el.value).toEqual(newValue);
	})
})

it('Swaps a value from an element with empty string by default', () => {
	const oldValue = 'old data';
	const el = MockElement({
		tagName: 'INPUT',
		type: 'text',
		value: oldValue,
	});
	const eventData = MockEvent('input', {
		target: el as HTMLInputElement
	});
	const handlerSpy = jest.fn();
	const source = Swap(undefined, handlerSpy) as Observer<any>;

	source.next(eventData);

	expect(handlerSpy).toHaveBeenCalledWith(oldValue);
	expect(el.value).toEqual('');
});

it('Swaps a value using a function that transforms based on the old value', () => {
	const oldValue = '5';
	const replacementFn = (v: string) => String(Number(v) * 2);
	const el = MockElement({
		tagName: 'INPUT',
		type: 'text',
		value: oldValue,
	});
	const eventData = MockEvent('input', {
		target: el as HTMLInputElement
	});
	const handlerSpy = jest.fn();
	const source = Swap(replacementFn, handlerSpy) as Observer<any>;

	source.next(eventData);

	expect(handlerSpy).toHaveBeenCalledWith(oldValue);
	expect(el.value).toEqual('10');
});

describe('swap Event Operator', () => {
	it('Swaps and emits a value from an element with a static string', () => {
		const oldValue = 'old data';
		const newValue = 'new data';
		const el = MockElement({
			tagName: 'INPUT',
			type: 'text',
			value: oldValue,
		});
		const eventData = MockEvent('input', {
			target: el as HTMLInputElement
		});
		const handlerSpy = jest.fn();
		const pipeline = new Subject<typeof eventData>().pipe(swap(newValue)) as Observable<string> & Subject<typeof eventData>;

		pipeline.subscribe(x => handlerSpy(x));
		pipeline.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(oldValue);
		expect(el.value).toEqual(newValue);
	});

	it('Swaps and emits a value from an element with empty string', () => {
		const oldValue = 'old data';
		const el = MockElement({
			tagName: 'INPUT',
			type: 'text',
			value: oldValue,
		});
		const eventData = MockEvent('input', {
			target: el as HTMLInputElement
		});
		const handlerSpy = jest.fn();
		const pipeline = new Subject<typeof eventData>().pipe(swap('')) as Observable<string> & Subject<typeof eventData>;

		pipeline.subscribe(x => handlerSpy(x));
		pipeline.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(oldValue);
		expect(el.value).toEqual('');
	});



	it('Swaps a value using a function that generates new value from old', () => {
		const oldValue = 'test';
		const replacementFn = (v: string) => `${v}_modified`;
		const el = MockElement({
			tagName: 'INPUT',
			type: 'text',
			value: oldValue,
		});
		const eventData = MockEvent('input', {
			target: el as HTMLInputElement
		});
		const handlerSpy = jest.fn();
		const pipeline = new Subject<typeof eventData>().pipe(swap(replacementFn)) as Observable<string> & Subject<typeof eventData>;

		pipeline.subscribe(x => handlerSpy(x));
		pipeline.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(oldValue);
		expect(el.value).toEqual('test_modified');
	});

	it('Handles multiple swap operations in sequence', () => {
		const values = ['first', 'second', 'third'];
		const el = MockElement({
			tagName: 'INPUT',
			type: 'text',
			value: values[0],
		});
		const handlerSpy = jest.fn();
		const pipeline = new Subject<Event>().pipe(swap('replacement')) as Observable<string> & Subject<Event>;

		pipeline.subscribe(x => handlerSpy(x));

		values.forEach(val => {
			el.value = val;
			const eventData = MockEvent('input', { target: el as HTMLInputElement });
			pipeline.next(eventData);
		});

		expect(handlerSpy).toHaveBeenCalledTimes(3);
		expect(handlerSpy).toHaveBeenNthCalledWith(1, 'first');
		expect(handlerSpy).toHaveBeenNthCalledWith(2, 'second');
		expect(handlerSpy).toHaveBeenNthCalledWith(3, 'third');
		expect(el.value).toEqual('replacement');
	});
});
