import { defer, MockElement } from '../test-support';
import { Mixin, MIXIN_SINK_TAG } from './mixin-sink';
import { AttributeObjectSink } from './attribute-sink';
import { SINK_TAG } from '../constants';
import { waitingElementHandlers } from '../internal-state';

describe.skip('Mixin Sink.xxx', () => {

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

});

describe('Mixin Sink', () => {

	describe('Present Mixins', () => {

			it('removes null/undefined/false attributes', () => {
				const el = MockElement({
					attr1: 'test1',
					attr2: 'test2',
					attr3: 'test3',
				});

				const source = {
					'attr1': null,
					'attr2': undefined,
					'attr3': false,
				};

				const config = Mixin(source);
				const sink = config.sink(el);
				sink(config.source);

				expect(el.getAttribute('attr1')).toBeFalsy();
				expect(el.getAttribute('attr2')).toBeFalsy();
				expect(el.getAttribute('attr3')).toBeFalsy();
			});

			it.skip('unsets null/undefined/false event listeners', () => {
				const el = MockElement({
					onclick: ()=>null,
					onclock: ()=>null,
					onclack: ()=>null,
				});

				const source = {
					// 'onclick': null,
					'onclock': undefined,
					'onclack': false,
				};

				const config = Mixin(source);
				const sink = config.sink(el);
				sink(config.source);

				expect(el.onclick).toBeFalsy();
			});

		describe('Attributes', () => {

			describe('Boolean attributes', () => {

				describe('checked', () => {

					it('sets/unsets on true/false', () => {
						const el = MockElement({
							type: 'checkbox',
						});
						const source = {
							'checked': true
						};

						const config = Mixin(source);
						const sink = config.sink(el);
						sink(config.source);

						expect(el.checked).toBeTruthy();

						source.checked = false;
						sink(config.source);
						expect(el.checked).toBeFalsy();
					});

					it('sets/unsets on any/null', () => {
						const el = MockElement({
							type: 'checkbox',
						});
						const source = {
							'checked': 1
						} as Record<string, any>;

						const config = Mixin(source);
						const sink = config.sink(el);
						sink(config.source);

						expect(el.checked).toBeTruthy();

						source.checked = null;
						sink(config.source);
						expect(el.checked).toBeFalsy();
					});

				});

				describe('autoplay', () => {

					it('sets/unsets on true/false', () => {
						const el = MockElement({
							tagName: 'VIDEO',
						});
						const source = {
							'autoplay': true
						};

						const config = Mixin(source);
						const sink = config.sink(el);
						sink(config.source);

						expect(el.autoplay).toBeTruthy();

						source.autoplay = false;
						sink(config.source);
						expect(el.autoplay).toBeFalsy();
					});

				});

			});

			describe('when falsy values are provided', () => {

				it('removes attributes when set to falsy values', () => {
					const el = MockElement({
						'data-foo': 'bar',
						'title': 'initial title',
						'className': 'initial class',
					});

					const source = {
						'data-foo': false,
						'title': null,
						'class': undefined,
					};

					const config = Mixin(source);
					const sink = config.sink(el);
					sink(config.source);

					expect(el.getAttribute('data-foo')).toBeFalsy();
					expect(el.getAttribute('title')).toBeFalsy();
					expect(el.className).toBe('initial class');
				});

			});

		});

	});

	describe('Future Mixins', () => {

		describe('when creating sink configuration', () => {

			it('creates sink binding configuration for future source', () => {
				const futureSource = Promise.resolve({
					'data-future': 'value',
					'class': 'future-class'
				});

				const config = Mixin(futureSource);

				expect(config.type).toBe(SINK_TAG);
				expect(config.t).toBe(MIXIN_SINK_TAG);
				expect(config.source).toBe(futureSource);
				expect(config.sink).toBe(AttributeObjectSink);
			});
		});

	});

	describe('Chronosymptons', () => {

		describe('when both present and future values are mixed together', () => {

			it('bakes present values in the HTML', () => {
				const el = MockElement();
				const chronosympton = {
					'data-present': 'present',
					'data-future': defer('future'),
				};

				const config = Mixin(chronosympton);
				const sink = config.sink(el);
				sink(config.source);

				expect(el.dataset.present).toBe(chronosympton['data-present']);
				expect(el.dataset.future).toBeFalsy();
			});

			it.skip('leaves future values for mount time');

		});

	});

	describe('when handling mixed attribute types in single mixin', () => {

		describe('when all attribute types are combined', () => {

			it('handles mixed attribute types in single mixin', () => {
				const el = MockElement();
				const clickHandler = jest.fn();

				const source = {
					// Regular attributes
					'id': 'complex-mixin',
					'class': 'complex-class',
					'title': 'Complex Mixin',

					// Data attributes
					'data-complex': 'value',

					// Boolean attributes
					'disabled': false,
					'readonly': true,

					// Event listeners
					'onclick': clickHandler,

					// Style (if supported)
					'style': {
						'color': 'red',
						'font-weight': 'bold',
					}
				};

				const config = Mixin(source);
				const sink = config.sink(el);
				sink(config.source);

				expect(el.id).toBe('complex-mixin');
				expect(el.className).toContain('complex-class');
				expect(el.getAttribute('title')).toBe('Complex Mixin');
				expect(el.dataset.complex).toBe('value');
				expect(el.disabled).not.toBe(true);
				expect(el.readOnly).toBe(true);
				expect(el.style.color).toBe('red');
				// expect(el.style.fontWeight).toBe('bold');

				const clickEvent = new Event('click');
				el.dispatchEvent(clickEvent);
				expect(clickHandler).toHaveBeenCalledWith(clickEvent);
			});

		});

	});

	describe('when applying multiple mixins to same element', () => {

		it('a mixin overwrites attributes set by the previous one', () => {
			const el = MockElement();

			const firstSource = {
				'id': 'first-id',
				'data-value': 'first'
			};

			const secondSource = {
				'id': 'second-id',
				'data-value': 'second'
			};

			const config1 = Mixin(firstSource);
			const config2 = Mixin(secondSource);

			const sink1 = config1.sink(el);
			const sink2 = config2.sink(el);

			sink1(config1.source);
			expect(el.id).toBe('first-id');
			expect(el.dataset.value).toBe('first');

			sink2(config2.source);
			expect(el.id).toBe('second-id');
			expect(el.dataset.value).toBe('second');
		});

		it('adds classes withuot removing others', () => {
			const el = MockElement();

			const firstSource = {
				'class': 'first-class',
			};

			const secondSource = {
				'class': 'second-class',
			};

			const config1 = Mixin(firstSource);
			const config2 = Mixin(secondSource);

			const sink1 = config1.sink(el);
			const sink2 = config2.sink(el);

			sink1(config1.source);
			expect(el.className).toContain('first-class');

			sink2(config2.source);
			expect(el.className).toContain('second-class');
		});

	});

	describe('when null or undefined values are given', () => {

	});

	describe('when string "false" values are given', () => {

		describe('in a dataset', () => {

			it('applies "false" verbatim', () => {
				const el = MockElement();

				const source = {
					'data-false': 'false',
					'data-true': 'true',
				};

				const config = Mixin(source);
				const sink = config.sink(el);
				sink(config.source);

				expect(el.dataset.false).toBe('false');
				expect(el.dataset.true).toBe('true');
			});

		});

		describe('for known boolean attributes', () => {

			it('removes the attribute', () => {
				const el = MockElement();

				const source = {
					'disabled': 'false',
					'readonly': 'false'
				};

				const config = Mixin(source);
				const sink = config.sink(el);
				sink(config.source);

				expect(el.getAttribute('disabled')).toBeFalsy();
				expect(el.getAttribute('readonly')).toBeFalsy();
			});

		});


		describe('for a generic attribute', () => {

			it('applies "false" verbatim', () => {
				const el = MockElement();

				const source = {
					'whatever': 'false',
				};

				const config = Mixin(source);
				const sink = config.sink(el);
				sink(config.source);

				expect(el.getAttribute('whatever')).toBe('false');
			});

		});

	});

	describe('Given sink configuration structure', () => {

		describe('when creating sink configuration', () => {

			describe('when valid source is provided', () => {

				it('returns correct sink binding configuration type', () => {
					const source = { 'test': 'value' };
					const config = Mixin(source);

					expect(config).toHaveProperty('type', SINK_TAG);
					expect(config).toHaveProperty('t', MIXIN_SINK_TAG);
					expect(config).toHaveProperty('source', source);
					expect(config).toHaveProperty('sink', AttributeObjectSink);
				});

				it('preserves source reference in configuration', () => {
					const source = { 'preserved': 'reference' };
					const config = Mixin(source);

					expect(config.source).toBe(source);
				});

			});

		});

	});

});
