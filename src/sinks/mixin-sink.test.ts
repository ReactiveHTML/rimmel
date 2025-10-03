import { MockElement } from '../test-support';
import { Mixin, MIXIN_SINK_TAG } from './mixin-sink';
import { AttributeObjectSink } from './attribute-sink';
import { SINK_TAG } from '../constants';

describe('Mixin Sink', () => {

    describe('Given a plain object mixin', () => {
        describe('when creating sink configuration', () => {
            it('creates sink binding configuration with correct properties', () => {
                const source = {
                    'data-foo': 'bar',
                    'class': 'test-class',
                    'id': 'test-id'
                };

                const config = Mixin(source);

                expect(config.type).toBe(SINK_TAG);
                expect(config.t).toBe(MIXIN_SINK_TAG);
                expect(config.source).toBe(source);
                expect(config.sink).toBe(AttributeObjectSink);
            });
        });

        describe('when applying attributes to element', () => {
            describe('when regular attributes are provided', () => {
                it('applies plain object attributes to element immediately', () => {
                    const el = MockElement();
                    const source = {
                        'data-foo': 'bar',
                        'class': 'test-class',
                        'id': 'test-id',
                        'title': 'test-title'
                    };

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    expect(el.dataset.foo).toBe('bar');
                    expect(el.className).toBe('test-class');
                    expect(el.id).toBe('test-id');
                    expect(el.getAttribute('title')).toBe('test-title');
                });
            });

            describe('when boolean attributes are provided', () => {
                it('handles boolean attributes correctly', () => {
                    const el = MockElement();
                    const source = {
                        'disabled': true,
                        'readonly': 'readonly',
                        'checked': false
                    };

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    expect(el.disabled).toBe(true);
                    expect(el.readOnly).toBe('readonly');
                    expect(el.checked).toBe(false);
                });
            });

            describe('when falsey values are provided', () => {
                it('removes attributes when set to falsey values', () => {
                    const el = MockElement();
                    
                    // Set initial attributes
                    el.setAttribute('data-foo', 'bar');
                    el.setAttribute('title', 'initial-title');
                    el.className = 'initial-class';

                    const source = {
                        'data-foo': false,
                        'title': null,
                        'class': undefined
                    };

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    expect(el.getAttribute('data-foo')).toBeUndefined();
                    expect(el.getAttribute('title')).toBeUndefined();
                    expect(el.className).toBe('');
                });
            });
        });
    });

    describe('Given a future/promise mixin', () => {
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

        describe('when applying future attributes', () => {
            describe('when promise resolves successfully', () => {
                it('applies future attributes when promise resolves', async () => {
                    const el = MockElement();
                    const futureSource = Promise.resolve({
                        'data-future': 'resolved-value',
                        'class': 'resolved-class',
                        'title': 'resolved-title'
                    });

                    const config = Mixin(futureSource);
                    const sink = config.sink(el);
                    
                    // Apply the sink (this should handle the promise)
                    sink(config.source);

                    // Wait for promise to resolve
                    await new Promise(resolve => setTimeout(resolve, 10));

                    expect(el.dataset.future).toBe('resolved-value');
                    expect(el.className).toBe('resolved-class');
                    expect(el.getAttribute('title')).toBe('resolved-title');
                });
            });
        });
    });

    describe('Given event listener mixins', () => {
        describe('when applying event listeners from mixin object', () => {
            describe('when multiple event handlers are provided', () => {
                it('applies event listeners from mixin object', () => {
                    const el = MockElement();
                    const clickHandler = jest.fn();
                    const mouseoverHandler = jest.fn();

                    const source = {
                        'onclick': clickHandler,
                        'onmouseover': mouseoverHandler,
                        'class': 'event-class'
                    };

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    expect(el.className).toBe('event-class');
                    
                    // Verify event listeners are attached
                    const clickEvent = new Event('click');
                    el.dispatchEvent(clickEvent);
                    expect(clickHandler).toHaveBeenCalledWith(clickEvent);

                    const mouseoverEvent = new Event('mouseover');
                    el.dispatchEvent(mouseoverEvent);
                    expect(mouseoverHandler).toHaveBeenCalledWith(mouseoverEvent);
                });
            });
        });

        describe('when handling future event listeners', () => {
            describe('when promise resolves with event handlers', () => {
                it('handles future event listeners', async () => {
                    const el = MockElement();
                    const futureHandler = jest.fn();

                    const futureSource = Promise.resolve({
                        'onclick': futureHandler,
                        'data-future-event': 'true'
                    });

                    const config = Mixin(futureSource);
                    const sink = config.sink(el);
                    sink(config.source);

                    // Wait for promise to resolve
                    await new Promise(resolve => setTimeout(resolve, 10));

                    expect(el.dataset.futureEvent).toBe('true');
                    
                    const clickEvent = new Event('click');
                    el.dispatchEvent(clickEvent);
                    expect(futureHandler).toHaveBeenCalledWith(clickEvent);
                });
            });
        });
    });

    describe('Given complex mixin scenarios', () => {
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
                        'data-number': 42,
                        
                        // Boolean attributes
                        'disabled': false,
                        'readonly': true,
                        
                        // Event listeners
                        'onclick': clickHandler,
                        
                        // Style (if supported)
                        'style': 'color: red; font-weight: bold;'
                    };

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    expect(el.id).toBe('complex-mixin');
                    expect(el.className).toBe('complex-class');
                    expect(el.getAttribute('title')).toBe('Complex Mixin');
                    expect(el.dataset.complex).toBe('value');
                    expect(el.dataset.number).toBe('42');
                    expect(el.disabled).toBe(false);
                    expect(el.readOnly).toBe(true);
                    expect(el.getAttribute('style')).toBe('color: red; font-weight: bold;');

                    const clickEvent = new Event('click');
                    el.dispatchEvent(clickEvent);
                    expect(clickHandler).toHaveBeenCalledWith(clickEvent);
                });
            });
        });

        describe('when applying multiple mixins to same element', () => {
            describe('when second mixin overwrites first mixin', () => {
                it('overwrites previous attributes when applied multiple times', () => {
                    const el = MockElement();
                    
                    const firstSource = {
                        'id': 'first-id',
                        'class': 'first-class',
                        'data-value': 'first'
                    };

                    const secondSource = {
                        'id': 'second-id',
                        'class': 'second-class',
                        'data-value': 'second'
                    };

                    const config1 = Mixin(firstSource);
                    const config2 = Mixin(secondSource);
                    
                    const sink1 = config1.sink(el);
                    const sink2 = config2.sink(el);

                    sink1(config1.source);
                    expect(el.id).toBe('first-id');
                    expect(el.className).toBe('first-class');
                    expect(el.dataset.value).toBe('first');

                    sink2(config2.source);
                    expect(el.id).toBe('second-id');
                    expect(el.className).toBe('second-class');
                    expect(el.dataset.value).toBe('second');
                });
            });
        });
    });

    describe('Given edge cases', () => {
        describe('when an empty mixin object is given', () => {
            describe('when no attributes are provided', () => {
                it('handles empty mixin object', () => {
                    const el = MockElement();
                    const source = {};

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    // Should not throw and element should remain unchanged
                    expect(el.className).toBe('');
                    expect(el.id).toBe('');
                });
            });
        });

        describe('when null or undefined values are given', () => {
            describe('when attributes have null/undefined values', () => {
                it('handles null and undefined values in mixin', () => {
                    const el = MockElement();
                    
                    // Set initial attributes
                    el.setAttribute('data-foo', 'bar');
                    el.className = 'initial-class';

                    const source = {
                        'data-foo': null,
                        'class': undefined,
                        'title': '',
                        'id': 'valid-id'
                    };

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    expect(el.getAttribute('data-foo')).toBeUndefined();
                    expect(el.className).toBe('');
                    expect(el.getAttribute('title')).toBeUndefined();
                    expect(el.id).toBe('valid-id');
                });
            });
        });

        describe('when string "false" values are given', () => {
            describe('when attributes contain string "false"', () => {
                it('handles string "false" values correctly', () => {
                    const el = MockElement();
                    
                    const source = {
                        'data-false': 'false',
                        'data-true': 'true',
                        'disabled': 'false',
                        'readonly': 'false'
                    };

                    const config = Mixin(source);
                    const sink = config.sink(el);
                    sink(config.source);

                    // String "false" should be treated as falsy for attribute removal
                    expect(el.getAttribute('data-false')).toBeUndefined();
                    expect(el.dataset.true).toBe('true');
                    expect(el.disabled).toBe(false);
                    expect(el.getAttribute('readonly')).toBeUndefined();
                });
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
