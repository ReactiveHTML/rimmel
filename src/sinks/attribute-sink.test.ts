import { MockElement } from '../test-support';
import { AttributeObjectSink } from './attribute-sink';

describe('Attribute Sink', () => {

	describe('Given an attribute object', () => {

		it('sets attributes on sink', () => {
			const el = MockElement();
			const sink = AttributeObjectSink(<HTMLElement>el);

			sink({
				'data-foo': 'bar',
				'readonly': 'readonly',
				'class': 'class1',
			});

			expect(el.readOnly).toBe('readonly');
			expect(el.className).toContain('class1');
			expect(el.dataset.foo).toEqual( 'bar');
		});

		it('clears falsy attributes on sink', () => {
			const el = MockElement({
				'data-foo': 'bar',
				'readonly':'readonly',
				'custom-attribute': 'custom-value',
			});
			const sink = AttributeObjectSink(<HTMLElement>el);

			sink({
				'data-foo': false,
				'readonly': false,
				'custom-attribute': false,
			});

			expect(el.dataset.foo).toBe(false);
			expect(el.readOnly).not.toBe('readonly');
			expect(el.getAttribute('customAttribute')).toBeUndefined();
		});

	});

});
