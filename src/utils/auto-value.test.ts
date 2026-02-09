import { MockElement } from '../test-support';
import { autoValue } from './auto-value';

describe('AutoValue', () => {

	describe('input type=checkbox', () => {

		it('Gets its boolean value', () => {
			const value = Symbol('v');

			const el = MockElement({
				tagName: 'INPUT',
				type: 'checkbox',
				checked: value,
			});

			expect(autoValue(el)).toEqual(value);
		});

	});

	describe('input type=number', () => {

		it('Gets its numeric value', () => {
			const value = 99;

			const el = MockElement({
				tagName: 'INPUT',
				type: 'number',
				value: "doesn't matter, shouldn't read this anyway",
				valueAsNumber: value,
			});

			expect(autoValue(el)).toEqual(value);
		});

	});

	describe('input type=date', () => {

		it('Gets its date value', () => {
			const value = new Date();

			const el = MockElement({
				tagName: 'INPUT',
				type: 'date',
				value: "doesn't matter, shouldn't read this anyway",
				valueAsDate: value,
			});

			expect(autoValue(el)).toEqual(value);
		});

	});

	describe('input type=text', () => {

		it('Gets its regular, string value', () => {
			const value = 'very much';

			const el = MockElement({
				tagName: 'INPUT',
				type: 'text',
				value,
			});

			expect(autoValue(el)).toEqual(value);
		});

		it('Gets its regular, string value', () => {
			const value = 'very much';

			const el = MockElement({
				tagName: 'INPUT',
				value,
			});

			expect(autoValue(el)).toEqual(value);
		});

	});

	describe('select', () => {

		it('Gets its regular, string value', () => {
			const value = 'Fragilistic';

			const el = MockElement({
				tagName: 'SELECT',
				value,
			});

			expect(autoValue(el)).toEqual(value);
		});

	});


	describe('any-element', () => {

		it('Gets its innerText value', () => {
			const value = 'thank you';

			const el = MockElement({
				tagName: 'ANOTHER-TAG',
				value: undefined,
				innerText: value,
			});

			expect(autoValue(el)).toEqual(value);
		});
	});

});

