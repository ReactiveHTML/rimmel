import { MockElement } from '../test-support';
import { Mixin, MIXIN_SINK_TAG } from './mixin-sink';
import { AttributeObjectSink } from './attribute-sink';
import { SINK_TAG } from '../constants';

describe('Mixin Sink', () => {

	describe('when a plain object mixin', () => {
		it.skip('defers to AttributeObjectSink');
	});

	describe('when an "on*" is emitted', () => {
		it.skip('adds an event listener');
	});

	describe('when a data- attribute is emitted', () => {
		it.skip('defers to DatasetItemPreSink');
	});

	describe('when a dataset object is emitted', () => {
		it.skip('defers to DatasetObjectSink');
	});

	describe('when the underlying element is a form', () => {
		it.skip('defers to FormElementSink');
	});

	describe('when undefined/false/undefined is emitted', () => {
		it.skip('removes the corresponding attribute');
	});

});

// describe('Mixin Sink', () => {
// 
// 	describe('given a plain object mixin', () => {
// 
// 		describe('when applying attributes to element', () => {
// 
// 			describe('when boolean attributes are provided', () => {
// 
// 				it('sets true boolean attributes', () => {
// 					const el = MockElement({
// 						type: 'checkbox',
// 					});
// 					const source = {
// 						'checked': true
// 					};
// 
// 					const config = Mixin(source);
// 					const sink = config.sink(el);
// 					sink(config.source);
// 
// 					expect(el.checked).toBe(true);
// 				});
// 
// 			});
// 
// 			describe('when falsey values are provided', () => {
// 
// 				it('removes attributes when set to falsey values', () => {
// 					const el = MockElement({
// 						'data-foo': 'bar',
// 						'title': 'initial title',
// 						'className': 'initial class',
// 					});
// 
// 					const source = {
// 						'data-foo': false,
// 						'title': null,
// 						'class': undefined
// 					};
// 
// 					const config = Mixin(source);
// 					const sink = config.sink(el);
// 					sink(config.source);
// 
// 					expect(el.getAttribute('data-foo')).toBeUndefined();
// 					expect(el.getAttribute('title')).toBeUndefined();
// 					expect(el.className).toBe('initial class');
// 				});
// 
// 			});
// 
// 		});
// 
// 	});
// 
// 	describe('Given a future/promise mixin', () => {
// 
// 		describe('when creating sink configuration', () => {
// 
// 			it('creates sink binding configuration for future source', () => {
// 				const futureSource = Promise.resolve({
// 					'data-future': 'value',
// 					'class': 'future-class'
// 				});
// 
// 				const config = Mixin(futureSource);
// 
// 				expect(config.type).toBe(SINK_TAG);
// 				expect(config.t).toBe(MIXIN_SINK_TAG);
// 				expect(config.source).toBe(futureSource);
// 				expect(config.sink).toBe(AttributeObjectSink);
// 			});
// 		});
// 
// 	});
// 
// 	describe('Given event listener mixins', () => {
// 
// 		describe('when applying event listeners from mixin object', () => {
// 
// 			describe('when multiple event handlers are provided', () => {
// 
// 				it('applies event listeners from mixin object', () => {
// 					const el = MockElement();
// 					const clickHandler = jest.fn();
// 					const mouseoverHandler = jest.fn();
// 
// 					const source = {
// 						'onclick': clickHandler,
// 						'onmouseover': mouseoverHandler,
// 					};
// 
// 					const config = Mixin(source);
// 					const sink = config.sink(el);
// 					sink(config.source);
// 
// 					// Verify event listeners are attached
// 					const clickEvent = new Event('click');
// 					el.dispatchEvent(clickEvent);
// 					expect(clickHandler).toHaveBeenCalledWith(clickEvent);
// 
// 					const mouseoverEvent = new Event('mouseover');
// 					el.dispatchEvent(mouseoverEvent);
// 					expect(mouseoverHandler).toHaveBeenCalledWith(mouseoverEvent);
// 				});
// 
// 			});
// 
// 		});
// 
// 	});
// 
// 	describe('Given complex mixin scenarios', () => {
// 
// 		describe('when handling mixed attribute types in single mixin', () => {
// 
// 			describe('when all attribute types are combined', () => {
// 
// 				it('handles mixed attribute types in single mixin', () => {
// 					const el = MockElement();
// 					const clickHandler = jest.fn();
// 
// 					const source = {
// 						// Regular attributes
// 						'id': 'complex-mixin',
// 						'class': 'complex-class',
// 						'title': 'Complex Mixin',
// 
// 						// Data attributes
// 						'data-complex': 'value',
// 
// 						// Boolean attributes
// 						'disabled': false,
// 						'readonly': true,
// 
// 						// Event listeners
// 						'onclick': clickHandler,
// 
// 						// Style (if supported)
// 						'style': 'color: red; font-weight: bold;'
// 					};
// 
// 					const config = Mixin(source);
// 					const sink = config.sink(el);
// 					sink(config.source);
// 
// 					expect(el.id).toBe('complex-mixin');
// 					expect(el.className).toBe('complex-class');
// 					expect(el.getAttribute('title')).toBe('Complex Mixin');
// 					expect(el.dataset.complex).toBe('value');
// 					expect(el.disabled).toBe(undefined);
// 					expect(el.readOnly).toBe(true);
// 					expect(el.getAttribute('style')).toBe('color: red; font-weight: bold;');
// 
// 					const clickEvent = new Event('click');
// 					el.dispatchEvent(clickEvent);
// 					expect(clickHandler).toHaveBeenCalledWith(clickEvent);
// 				});
// 
// 			});
// 
// 		});
// 
// 		describe('when applying multiple mixins to same element', () => {
// 
// 			describe('when second mixin overwrites first mixin', () => {
// 
// 				it('overwrites previous attributes when applied multiple times', () => {
// 					const el = MockElement();
// 
// 					const firstSource = {
// 						'id': 'first-id',
// 						'class': 'first-class',
// 						'data-value': 'first'
// 					};
// 
// 					const secondSource = {
// 						'id': 'second-id',
// 						'class': 'second-class',
// 						'data-value': 'second'
// 					};
// 
// 					const config1 = Mixin(firstSource);
// 					const config2 = Mixin(secondSource);
// 
// 					const sink1 = config1.sink(el);
// 					const sink2 = config2.sink(el);
// 
// 					sink1(config1.source);
// 					expect(el.id).toBe('first-id');
// 					expect(el.className).toBe('first-class');
// 					expect(el.dataset.value).toBe('first');
// 
// 					sink2(config2.source);
// 					expect(el.id).toBe('second-id');
// 					expect(el.className).toBe('second-class');
// 					expect(el.dataset.value).toBe('second');
// 				});
// 
// 			});
// 
// 		});
// 
// 	});
// 
// 	describe('Given edge cases', () => {
// 
// 		describe('when an empty mixin object is given', () => {
// 
// 			describe('when no attributes are provided', () => {
// 
// 				it('handles empty mixin object', () => {
// 					const el = MockElement();
// 					const source = {};
// 
// 					const config = Mixin(source);
// 					const sink = config.sink(el);
// 					sink(config.source);
// 
// 					// Should not throw and element should remain unchanged
// 					expect(el.className).toBe('');
// 					expect(el.id).toBe('');
// 				});
// 
// 			});
// 
// 		});
// 
// 		describe('when null or undefined values are given', () => {
// 
// 			describe('when attributes have null/undefined values', () => {
// 
// 				it('handles null and undefined values in mixin', () => {
// 					const el = MockElement();
// 
// 					// Set initial attributes
// 					el.setAttribute('data-foo', 'bar');
// 					el.className = 'initial-class';
// 
// 					const source = {
// 						'data-foo': null,
// 						'class': undefined,
// 						'title': '',
// 						'id': 'valid-id'
// 					};
// 
// 					const config = Mixin(source);
// 					const sink = config.sink(el);
// 					sink(config.source);
// 
// 					expect(el.getAttribute('data-foo')).toBeUndefined();
// 					expect(el.className).toBe('');
// 					expect(el.getAttribute('title')).toBeUndefined();
// 					expect(el.id).toBe('valid-id');
// 				});
// 
// 			});
// 
// 		});
// 
// 		describe('when string "false" values are given', () => {
// 
// 			describe('when attributes contain string "false"', () => {
// 
// 				it('handles string "false" values correctly', () => {
// 					const el = MockElement();
// 
// 					const source = {
// 						'data-false': 'false',
// 						'data-true': 'true',
// 						'disabled': 'false',
// 						'readonly': 'false'
// 					};
// 
// 					const config = Mixin(source);
// 					const sink = config.sink(el);
// 					sink(config.source);
// 
// 					// String "false" should be treated as falsy for attribute removal
// 					expect(el.getAttribute('data-false')).toBeUndefined();
// 					expect(el.dataset.true).toBe('true');
// 					expect(el.disabled).toBe(false);
// 					expect(el.getAttribute('readonly')).toBeUndefined();
// 				});
// 
// 			});
// 
// 		});
// 
// 	});
// 
// 	describe('Given sink configuration structure', () => {
// 
// 		describe('when creating sink configuration', () => {
// 
// 			describe('when valid source is provided', () => {
// 
// 				it('returns correct sink binding configuration type', () => {
// 					const source = { 'test': 'value' };
// 					const config = Mixin(source);
// 
// 					expect(config).toHaveProperty('type', SINK_TAG);
// 					expect(config).toHaveProperty('t', MIXIN_SINK_TAG);
// 					expect(config).toHaveProperty('source', source);
// 					expect(config).toHaveProperty('sink', AttributeObjectSink);
// 				});
// 
// 				it('preserves source reference in configuration', () => {
// 					const source = { 'preserved': 'reference' };
// 					const config = Mixin(source);
// 
// 					expect(config.source).toBe(source);
// 				});
// 
// 			});
// 
// 		});
// 
// 	});
// 
// });
