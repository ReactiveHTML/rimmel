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
			expect(el.dataset).toHaveProperty('foo', 'bar');
		});

		it('clears falsey attributes on sink', () => {
			const el = MockElement();
			const sink = AttributeObjectSink(<HTMLElement>el);

			el.setAttribute('data-foo', 'bar');
			el.setAttribute('readonly', 'readonly');
			el.setAttribute('custom-attribute', 'custom-value');

			sink({
				'data-foo': false,
				'readonly': false,
				'custom-attribute': null,
			});

			expect(el.readOnly).not.toBe('readonly');
			expect(el.getAttribute('custom-attribute')).toBeUndefined();
			expect(el.dataset).not.toHaveProperty('foo', 'bar');
		});

	});

});
