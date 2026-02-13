import { Swap } from './swap-source';
import { MockElement, MockEvent } from '../test-support';
import { Observer } from '../types';

describe('Swap Event Adapter', () => {

	describe('When a static replacement is supplied', () => {

		it('Swaps the old value with the supplied one', () => {
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
			const source = Swap(newValue, handlerSpy);

			source.next(eventData);

			expect(handlerSpy).toHaveBeenCalledWith(oldValue);
			expect(el.value).toEqual(newValue);
		});

	});

	describe('When the replacement is undefined', () => {

		it('Swaps to undefined', () => {
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

	});

	describe('When the replacement is a function', () => {

		it('Applies the supplied function to the old value to use as replacement', () => {
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

	});

});
