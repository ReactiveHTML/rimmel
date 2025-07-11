import { of, BehaviorSubject, Subject } from 'rxjs';
import { state, waitingElementHandlers } from '../internal-state';
import { AttributeObjectSink } from '../sinks/attribute-sink';
import { InnerText } from '../sinks/inner-text-sink';
import { RMLEventName } from '../types/dom';
import { rml } from './parser';

const defer = <T>(value: T, timeout = 500) => new Promise<T>((resolve) => setTimeout(() => resolve(value), timeout));

describe('Parser', () => {
	beforeEach(() => {
		waitingElementHandlers.clear();
		state.refCount = 0;
	});

	// FIXME: move to a beforeEeach() call. Doesn't seem to work in Bun.
	global.document = globalThis.document || {};
	global.document = globalThis.document;
	global.document.addEventListener = (eventName: RMLEventName, handler: EventListenerOrEventListenerObject) => {};
	waitingElementHandlers.clear();

	describe('Static values', () => {

		describe('Strings', () => {

			describe('Attributes', () => {

				it('interpolates simple strings', () => {
					const str = 'test';
					const template = rml`<div foo="${str}">Hello</div>`;

					expect(template).toEqual(`<div foo="${str}">Hello</div>`);
				});

				it('treats "undefined" as a string', () => {
					const str = 'undefined';
					const template = rml`<div foo="${str}">Hello</div>`;

					expect(template).toEqual(`<div foo="${str}">Hello</div>`);
				});

				it('treats "null" as a string', () => {
					const str = 'null';
					const template = rml`<div foo="${str}">Hello</div>`;

					expect(template).toEqual(`<div foo="${str}">Hello</div>`);
				});

				it('treats "null" as a string', () => {
					const str = 'null';
					const template = rml`<div foo="${str}">Hello</div>`;

					expect(template).toEqual(`<div foo="${str}">Hello</div>`);
				});

				it('supports HTML just like any string', () => {
					const str = '<span>HTML</span>';
					const template = rml`<div foo="${str}">Hello</div>`;

					expect(template).toEqual(`<div foo="${str}">Hello</div>`);
				});

				it('supports multiline strings', () => {
					// TBD: should it really behave like this?
					const str = `This is a
					multiline
					string`;
					const template = rml`<div foo="${str}">Hello</div>`;

					expect(template).toEqual(`<div foo="${str}">Hello</div>`);
				});

				it('supports multiline HTML strings', () => {
					// TBD: should it really behave like this?
					const str = `This is <span>a
					multiline</span>
					string <button onclick="alert('Hello')">Click me</button>
					`;
					const template = rml`<div foo="${str}">Hello</div>`;

					expect(template).toEqual(`<div foo="${str}">Hello</div>`);
				});
			});

			describe('Content', () => {

				it('interpolates simple strings', () => {
					const str = 'test';
					const template = rml`<div>${str}</div>`;

					expect(template).toEqual(`<div>${str}</div>`);
				});

				it('treats "undefined" as a string', () => {
					const str = 'undefined';
					const template = rml`<div>${str}</div>`;

					expect(template).toEqual(`<div>${str}</div>`);
				});

				it('treats "null" as a string', () => {
					const str = 'null';
					const template = rml`<div>${str}</div>`;

					expect(template).toEqual(`<div>${str}</div>`);
				});

				it('treats "null" as a string', () => {
					const str = 'null';
					const template = rml`<div>${str}</div>`;

					expect(template).toEqual(`<div>${str}</div>`);
				});

				it('supports HTML just like any string', () => {
					const str = '<span>HTML</span>';
					const template = rml`<div>${str}</div>`;

					expect(template).toEqual(`<div>${str}</div>`);
				});

				it('supports multiline strings', () => {
					const str = `This is a
					multiline
					string`;
					const template = rml`<div>${str}</div>`;

					expect(template).toEqual(`<div>${str}</div>`);
				});

				it('supports multiline HTML strings', () => {
					const str = `This is <span>a
					multiline</span>
					string <button onclick="alert('Hello')">Click me</button>
					`;
					const template = rml`<div>${str}</div>`;

					expect(template).toEqual(`<div>${str}</div>`);
				});
			});

		});

		describe('Numbers', () => {

			describe('Attributes', () => {

				it('handles numbers for attributes', () => {
					const num = 123;
					const template = rml`<div something="${num}">Hello</div>`;

					expect(template).toEqual(`<div something="${num}">Hello</div>`);
				});

				it('handles 0 as a string', () => {
					const num = 0;
					const template = rml`<div something="${num}">Hello</div>`;

					expect(template).toEqual(`<div something="${num}">Hello</div>`);
				});

				it('handles -0 as "0"', () => {
					const num = -0;
					const template = rml`<div something="${num}">Hello</div>`;

					expect(template).toEqual(`<div something="0">Hello</div>`);
				});

				it('handles NaN as a string', () => {
					const num = NaN;
					const template = rml`<div something="${num}">Hello</div>`;

					expect(template).toEqual(`<div something="${num}">Hello</div>`);
				});

				it('handles Infinity as a string', () => {
					const num = Infinity;
					const template = rml`<div something="${num}">Hello</div>`;

					expect(template).toEqual(`<div something="Infinity">Hello</div>`);
				});

				it('handles -Infinity as a string', () => {
					const num = -Infinity;
					const template = rml`<div something="${num}">Hello</div>`;

					expect(template).toEqual(`<div something="-Infinity">Hello</div>`);
				});

			});

			describe('Content', () => {

				it('handles numbers as strings', () => {
					const num = 123;
					const template = rml`<div>${num}</div>`;

					expect(template).toEqual(`<div>${num}</div>`);
				});

				it('handles 0 as strings', () => {
					const num = 0;
					const template = rml`<div>${num}</div>`;

					expect(template).toEqual(`<div>${num}</div>`);
				});

				it('handles -0 as "0"', () => {
					// Don't ask why, it's a JavaScript quirk
					const num = -0;
					const template = rml`<div>${num}</div>`;

					expect(template).toEqual(`<div>0</div>`);
				});

				it('handles NaN as a string', () => {
					const num = NaN;
					const template = rml`<div>${num}</div>`;

					expect(template).toEqual(`<div>NaN</div>`);
				});

				it('handles Infinity as a string', () => {
					const num = Infinity;
					const template = rml`<div>${num}</div>`;

					expect(template).toEqual(`<div>Infinity</div>`);
				});

				it('handles -Infinity as a string', () => {
					const num = -Infinity;
					const template = rml`<div>${num}</div>`;

					expect(template).toEqual(`<div>-Infinity</div>`);
				});

			});

		});

		describe('Booleans', () => {
			describe('Attributes', () => {

				it('handles true as a string', () => {
					const bool = true;
					const template = rml`<div something="${bool}">Hello</div>`;

					expect(template).toEqual(`<div something="true">Hello</div>`);
				});

				it('handles false as a string', () => {
					const bool = false;
					const template = rml`<div something="${bool}">Hello</div>`;

					expect(template).toEqual(`<div something="false">Hello</div>`);
				});

			});

			describe('Content', () => {

				it('handles true as a string', () => {
					const bool = true;
					const template = rml`<div>${bool}</div>`;

					expect(template).toEqual(`<div>${bool}</div>`);
				});

				it('handles false as a string', () => {
					const bool = false;
					const template = rml`<div>${bool}</div>`;

					expect(template).toEqual(`<div>${bool}</div>`);
				});

			});

		});

		describe.skip('Symbols', () => {
			describe('Attributes', () => {

				it('handles symbols as strings', () => {
					const sym = Symbol('test');
					const template = rml`<div something="${sym}">Hello</div>`;

					expect(template).toEqual(`<div something="${sym.toString()}">Hello</div>`);
				});

			});

			describe('Content', () => {

				it('handles symbols as strings', () => {
					const sym = Symbol('test');
					const template = rml`<div>${sym}</div>`;

					expect(template).toEqual(`<div>${sym.toString()}</div>`);
				});

			});

		});

	});

	describe('Sources', () => {
		describe('Event Handlers', () => {

			it('registers an event listener function', () => {
				const handlerFn = () => {};
				const template = rml`<div onclick="${handlerFn}">Hello</div>`;

				expect(template).toEqual('<div _onclick="RMLREF+0" resolve="RMLREF+0">Hello</div>');
				expect(waitingElementHandlers.get('RMLREF+0')).toEqual([{
					eventName: 'click',
					listener: handlerFn,
					type: 'source',
				}]);
			});

			it('registers an event listener observer', () => {
				const handlerStream = new Subject<Event>();
				const template = rml`<div onmouseover="${handlerStream}">Hello</div>`;

				expect(template).toMatch(/<div .*>Hello<\/div>/);
				expect(waitingElementHandlers.get('RMLREF+0')).toEqual([{
					eventName: 'mouseover',
					listener: handlerStream,
					type: 'source',
				}]);
			});

		});

	});

	describe('Sinks', () => {

		describe('Attributes', () => {
		});

		describe('Dataset', () => {

			describe('When a key is specified', () => {

				it('sets the value inline', () => {
					const foo = 'bar';
					const template = rml`<div data-foo="${foo}">Hello</div>`;

					expect(template).toEqual('<div data-foo="bar">Hello</div>');
				});

				it('sets deferred values later, initial value is empty', () => {
					const foo = defer('bar');
					const template = rml`<div data-foo="${foo}">Hello</div>`;

					expect(template).toMatch(/<div .* data-foo="">Hello<\/div>/);
					expect(waitingElementHandlers.get('RMLREF+0')).toMatchObject([
						// TODO: match the sink, too
						{ source: foo, type: 'sink', t: 'data-foo' },
					]);
				});

			});

		});

		describe('Mixins', () => {

			describe('Syntax', () => {

				it('works with spread operator (...) prefix', () => {
					const a = { 'data-foo': 'bar' };
					const template = rml`<div ...${a}>Hello</div>`;

					expect(template).toMatch(/<div .* data-foo="bar">Hello<\/div>/);
				});

				it('works without ...', () => {
					const a = { 'data-foo': 'bar' };
					const template = rml`<div ${a}>Hello</div>`;

					expect(template).toMatch(/<div .* data-foo="bar">Hello<\/div>/);
				});

			});

			describe('Futures', () => {

				it('works with promises', () => {
					const a = defer({ 'data-foo': 'bar' });
					const template = rml`<div ...${a}>Hello</div>`;

					expect(template).toMatch(/<div.*resolve="RMLREF\+0".*>Hello<\/div>/);
					expect(waitingElementHandlers.get('RMLREF+0')).toEqual([
						{ source: a, sink: AttributeObjectSink, type: 'sink', t: 'mixin' },
					]);
				});

				it('works with observables', () => {
					const a = of({ 'data-foo': 'bar' });
					const template = rml`<div ...${a}>Hello</div>`;

					expect(template).toMatch(/<div.*resolve="RMLREF\+0".*>Hello<\/div>/);
					expect(waitingElementHandlers.get('RMLREF+0')).toEqual([
						{ source: a, sink: AttributeObjectSink, type: 'sink', t: 'mixin' },
					]);
				});

				it('works with presents followed by promises', () => {
					const a = { 'data-foo': 'bar' };
					const b = defer({ 'data-bar': 'baz' });
					const template = rml`<div ...${a} ...${b}>Hello</div>`;

					expect(template).toMatch(/<div.*resolve="RMLREF\+0".* data-foo="bar".*>Hello<\/div>/);
					expect(waitingElementHandlers.get('RMLREF+0')![1]).toEqual(
						{ type: 'sink', t: 'mixin', source: b, sink: AttributeObjectSink },
					);
				});

				it.skip('works with promises followed by presents', () => {
					const a = defer({ 'data-bar': 'baz' });
					const b = { 'data-foo': 'bar' };
					const template = rml`<div ...${a} ...${b}>Hello</div>`;

					expect(template).toMatch(/<div.*resolve="RMLREF\+0".* data-foo="bar".*>Hello<\/div>/);
					expect(waitingElementHandlers.get('RMLREF+0')![0]).toEqual(
						{ type: 'sink', t: 'mixin', source: b, sink: AttributeObjectSink },
					);
				});

				describe('Event Handlers', () => {
					it('bakes string listeners inline', () => {
						const a = { 'onmouseover': 'alert(123)' };
						const template = rml`<div ...${a}>Hello</div>`;

						expect(template).toMatch(/<div.*resolve="RMLREF\+0".* onmouseover="alert\(123\)">Hello<\/div>/);
					});

					it('leaves referenced listeners to set on mount', () => {
						const fn = () => alert(123);
						const a = { 'onmouseover': fn };
						const template = rml`<div ...${a}>Hello</div>`;

						expect(template).toMatch(/<div.*resolve="RMLREF\+0".*>Hello<\/div>/);
						expect(waitingElementHandlers.get('RMLREF+0')![0]).toStrictEqual(
							{ type: 'sink', t: 'mixin', source: { 'onmouseover': fn }, sink: AttributeObjectSink },
						);
					});

					it('always defers onmount', () => {
						const fn = () => alert(123);
						const a = { 'onmount': fn };
						const template = rml`<div ...${a}>Hello</div>`;

						expect(template).toMatch(/<div.*resolve="RMLREF\+0".*>Hello<\/div>/);
						expect(waitingElementHandlers.get('RMLREF+0')![0]).toStrictEqual(
							{ type: 'sink', t: 'mixin', source: { 'onmount': fn }, sink: AttributeObjectSink },
						);
					});

					it('always defers rml:onmount', () => {
						const fn = () => alert(123);
						const a = { 'rml:onmount': fn };
						const template = rml`<div ...${a}>Hello</div>`;

						expect(template).toMatch(/<div.*resolve="RMLREF\+0".*>Hello<\/div>/);
						expect(waitingElementHandlers.get('RMLREF+0')![0]).toStrictEqual(
							{ type: 'sink', t: 'mixin', source: { 'rml:onmount': fn }, sink: AttributeObjectSink },
						);
					});

				});


			});

			describe('When multiple mixins are passed together', () => {

				it('sets them correctly when adjacent', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const c = { 'data-c': 'c' };
					const template = rml`<div ...${a} ...${b} ...${c}>Hello</div>`;

					expect(template).toMatch(/<div .* data-a="a" data-b="b" data-c="c">Hello<\/div>/);
				});

				it('sets them correctly with other attributes in between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div ...${a} xxx="yyy" ...${b}>Hello</div>`;

					expect(template).toMatch(/<div .* data-a="a" xxx="yyy" data-b="b">Hello<\/div>/);
				});

				it('sets them correctly with various types of attributes in between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div ...${a} xxx="yyy" a="0" zzz c-hello ...${b}>Hello</div>`;

					expect(template).toMatch(/<div .* data-a="a" xxx="yyy" a="0" zzz c-hello data-b="b">Hello<\/div>/);
				});

				it('sets them correctly with other attributes around', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div aaa="bbb" ...${a} ...${b} ccc="ddd">Hello</div>`;

					expect(template).toMatch(/<div .* aaa="bbb" data-a="a" data-b="b" ccc="ddd">Hello<\/div>/);
				});

				it('sets them correctly with other attributes around and between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div aaa="bbb" ...${a} xxx="yyy" ...${b} ccc="ddd">Hello</div>`;

					expect(template).toMatch(/<div .* aaa="bbb" data-a="a" xxx="yyy" data-b="b" ccc="ddd">Hello<\/div>/);
				});

				it('sets them correctly with other passed-in attributes in between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const number = 42;
					const template = rml`<div aaa="bbb" ...${a} xxx="${number}" ...${b} ccc="ddd">Hello</div>`;

					expect(template).toMatch(/<div .* aaa="bbb" data-a="a" xxx="42" data-b="b" ccc="ddd">Hello<\/div>/);
				});

			});

			describe('When dataset attributes are passed', () => {

				it('sets their values inline', () => {
					const obj = { 'data-foo': 'bar', 'data-baz': 'qux' };
					const template = rml`<div ...${obj}>Hello</div>`;

					expect(template).toMatch(/<div.*data-foo="bar" data-baz="qux">Hello<\/div>/);
				});

				it('sets deferred values later, (initially empty), static ones inline', () => {
					const quz = defer('quz');
					const deferred = { 'data-baz': quz };
					const obj = { 'data-foo': 'bar', ...deferred};
					const template = rml`<div ...${obj}>Hello</div>`;

					expect(template).toMatch(/^<div.*data-foo="bar">Hello<\/div>/);
					expect(waitingElementHandlers.get('RMLREF+0')).toEqual([
						{ source: deferred, sink: AttributeObjectSink, type: 'sink', t: 'mixin' },
					]);
				});

			});

		});

		describe('Any sink', () => {

			describe('When a BehaviorSubject (.value) is passed', () => {

				describe('When an implicit sink is used', () => {

					it('sets the value inline', () => {
						const bs = new BehaviorSubject(123)
						const template = rml`<div>${bs}</div>`;

						expect(template).toMatch(/<div.*>123<\/div>/);
					});

				});

				describe('When an explicit sink is used', () => {

					it('sets the value inline', () => {
						const bs = new BehaviorSubject(123)
						const template = rml`<div>${InnerText(bs)}</div>`;

						expect(template).toMatch(/<div.*>123<\/div>/);
					});

				});

			});

		});

	});

	describe('Plain Objects', () => {
	});
});
