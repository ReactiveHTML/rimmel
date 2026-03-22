import { of, BehaviorSubject, Subject } from 'rxjs';
import { state, waitingElementHandlers } from '../internal-state';
import { AttributeObjectSink } from '../sinks/attribute-sink';
import { InnerText } from '../sinks/inner-text-sink';
import { RMLEventName } from '../types/dom';
import { rml } from './parser';

import { defer } from '../test-support';

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

				it('renders 0 for { value: 0 } expressions', () => {
					const expr = new BehaviorSubject(0);
					const template = rml`<div>${expr}</div>`;
					expect(template).toMatch(/<div.*>0<\/div>/);
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

			describe('Classes', () => {

				describe('When a string is passed', () => {

					it('sets the value inline', () => {
						const className = 'my-class';
						const template = rml`<div class="${className}">Hello</div>`;

						expect(template).toEqual('<div class="my-class">Hello</div>');
					});

					it('sets deferred values later, initial value is empty', () => {
						const className = defer('my-class');
						const template = rml`<div class="${className}">Hello</div>`;

						expect(template).toMatch(/<div.+class="">Hello<\/div>/);
						expect(waitingElementHandlers.get('RMLREF+0')).toMatchObject([
							// TODO: match the sink, too
							{ source: className, type: 'sink', t: 'class' },
						]);
					});

				});

				describe('When a plain object is passed', () => {

					it('sets the value inline', () => {
						const classes = {
							'class-a': true,
							'class-b': false,
							'class-c': true
						};
						const template = rml`<div class="${classes}">Hello</div>`;

						expect(template).toEqual('<div class="class-a class-c">Hello</div>');
					});

				});

				describe('When an object of deferred values is passed', () => {

					it('sets values later, initial value is empty', () => {
						const classes = { 'class-a': defer(true), 'class-b': defer(false) };
						const template = rml`<div class="${classes}">Hello</div>`;

						expect(template).toMatch(/<div.+class="">Hello<\/div>/);
						expect(waitingElementHandlers.get('RMLREF+0')).toMatchObject([
							// TODO: match the sink, too
							{ source: classes['class-a'], type: 'sink', t: 'class' },
						]);
					});

				});

			});

			describe('Styles', () => {

			});


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


			describe('Classes', () => {

				describe('When supplied classes resolve to a string', () => {

					describe('When a Simple Present Object (an object with only present values) is supplied', () => {

						it('bakes class values into the HTML', () => {
							const a = {
								class: 'cls1'
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*class="cls1".*>Hello<\/div>/);
						});

					});

					describe('When a Future Object (a Future<Object>) is supplied', () => {

						it('does not bake any values into the HTML', () => {
							const a = Promise.resolve({
								class: 'cls1'
							});
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div\s+resolve="RMLREF\+0"\s*>Hello<\/div>/);
						});

					});

					describe('When an Object of Futures is supplied', () => {

						it('does not bake any values into the HTML', () => {
							const a = {
								class: Promise.resolve('cls1'),
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div\s+resolve="RMLREF\+0"\s*>Hello<\/div>/);
						});

					});

				});

				describe('When supplied classes resolve to space-separated strings', () => {

					describe('When a Simple Present Object (an object with only present values) is supplied', () => {

						it('bakes class values into the HTML', () => {
							const a = {
								class: 'cls1 cls2'
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*class="cls1 cls2".*>Hello<\/div>/);
						});

					});

				});

				describe('When supplied classes resolve to objects', () => {

					describe('When a Simple Present Object (an object with only present values) is supplied', () => {

						it('only bakes present truthy class values into the HTML', () => {
							const a = {
								class: {
									cls1: true,
									cls2: true,
									cls3: false,
								},
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*class="cls1 cls2".*>Hello<\/div>/);
						});

					});

					describe('When a Class Chronosympton (an object with both present and future classes) is supplied', () => {

						it('only bakes present class values into the HTML', () => {
							const a = {
								class: {
									cls1: true,
									cls2: true,
									cls3: Promise.resolve(true),
								},
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*class="cls1 cls2".*>Hello<\/div>/);
						});

					});

				});

			});

			describe('Styles', () => {

				describe('When supplied styles resolve to a string', () => {

					describe('When a Simple Present Object (an object with only present values) is supplied', () => {

						it('bakes style values into the HTML', () => {
							const a = {
								style: 'color: red;'
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*style="color: red;".*>Hello<\/div>/);
						});

					});

					describe('When a Future Object (a Future<Object>) is supplied', () => {

						it('does not bake any values into the HTML', () => {
							const a = Promise.resolve({
								style: 'color: red;'
							});
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div\s+resolve="RMLREF\+0"\s*>Hello<\/div>/);
						});

					});

					describe('When an Object of Futures is supplied', () => {

						it('does not bake any values into the HTML', () => {
							const a = {
								style: Promise.resolve('color: red;'),
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div\s+resolve="RMLREF\+0"\s*>Hello<\/div>/);
						});

					});

				});

				describe('When supplied styles resolve to semicolon-separated strings', () => {

					describe('When a Simple Present Object (an object with only present values) is supplied', () => {

						it('bakes class values into the HTML', () => {
							const a = {
								style: 'color: red; background: blue;'
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*style="color: red; background: blue;".*>Hello<\/div>/);
						});

					});

				});

				describe('When supplied styles resolve to objects', () => {

					describe('When a Simple Present Object (an object with only present values) is supplied', () => {

						it('only bakes present truthy style values into the HTML', () => {
							const a = {
								style: {
									color: 'red',
									background: 'blue',
									pointer: null,
								},
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*style="color: red; background: blue;".*>Hello<\/div>/);
						});

					});

					describe('When a Style Chronosympton (an object with both present and future classes) is supplied', () => {

						it('only bakes present style values into the HTML', () => {
							const a = {
								style: {
									color: 'red',
									background: 'blue',
									pointer: Promise.resolve('none'),
								},
							};
							const template = rml`<div ${a}>Hello</div>`;

							expect(template).toMatch(/<div.*style="color: red; background: blue;".*>Hello<\/div>/);
						});

					});

				});

			});

			describe('Futures', () => {

				it('works with promises', () => {
					const a = defer({
						'data-foo': 'bar'
					});
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

				describe('When multiple mixins are merged into the same element', () => {

					describe('When a present mixin is followed by a future mixin', () => {

						it('presents are baked in, futures deferred', () => {
							const a = {
								'data-foo': 'bar'
							};
							const b = defer({
								'data-bar': 'baz'
							});
							const template = rml`<div ...${a} ...${b}>Hello</div>`;

							expect(template).toMatch(/<div.*resolve="RMLREF\+0".* data-foo="bar".*>Hello<\/div>/);
							expect(waitingElementHandlers.get('RMLREF+0')![1]).toEqual(
								{ type: 'sink', t: 'mixin', source: b, sink: AttributeObjectSink },
							);
						});

					});

					describe('When a future mixin is followed by a present mixin', () => {

						it('presents are baked in, futures deferred', async () => {
							const a = defer({ 'data-bar': 'baz' });
							const b = { 'data-foo': 'bar' };
							const template = rml`<div ...${a} ...${b}>Hello</div>`;

							expect(template).toMatch(/<div.*resolve="RMLREF\+0".* data-foo="bar".*>Hello<\/div>/);
							expect(waitingElementHandlers.get('RMLREF+0')![0]).toEqual(
								{ type: 'sink', t: 'mixin', source: a, sink: AttributeObjectSink },
							);
							expect(waitingElementHandlers.get('RMLREF+0')![0].source).resolves.toEqual(
								{ 'data-bar': 'baz' },
							);
						});

					});

					describe('When a future mixin is followed by another', () => {

						it('both futures are queued for mounting', async () => {
							const a = defer({ 'data-foo': 'bar' });
							const b = defer({ 'data-bar': 'baz' });
							const template = rml`<div ...${a} ...${b}>Hello</div>`;

							expect(template).toMatch(/<div.*resolve="RMLREF\+0"\s*>Hello<\/div>/);
							expect(waitingElementHandlers.get('RMLREF+0')![0]).toEqual(
								{ type: 'sink', t: 'mixin', source: a, sink: AttributeObjectSink },
							);
							expect(waitingElementHandlers.get('RMLREF+0')![0]).toEqual(
								{ type: 'sink', t: 'mixin', source: b, sink: AttributeObjectSink },
							);

							expect(waitingElementHandlers.get('RMLREF+0')![0].source).resolves.toEqual(
								{ 'data-foo': 'bar' },
							);
							expect(waitingElementHandlers.get('RMLREF+0')![1].source).resolves.toEqual(
								{ 'data-bar': 'baz' },
							);
						});

					});

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

					expect(template).toMatch(/<div .* data-a="a"\s+data-b="b"\s+data-c="c">Hello<\/div>/);
				});

				it('sets them correctly with other attributes in between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div ...${a} xxx="yyy" ...${b}>Hello</div>`;

					expect(template).toMatch(/<div .* data-a="a"\s+xxx="yyy"\s+data-b="b">Hello<\/div>/);
				});

				it('sets them correctly with various types of attributes in between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div ...${a} xxx="yyy" a="0" zzz c-hello ...${b}>Hello</div>`;

					expect(template).toMatch(/<div .* data-a="a"\s+xxx="yyy"\s+a="0"\s+zzz\s+c-hello\s+data-b="b">Hello<\/div>/);
				});

				it('sets them correctly with other attributes around', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div aaa="bbb" ...${a} ...${b} ccc="ddd">Hello</div>`;

					expect(template).toMatch(/<div .* aaa="bbb"\s+data-a="a"\s+data-b="b"\s+ccc="ddd">Hello<\/div>/);
				});

				it('sets them correctly with other attributes around and between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const template = rml`<div aaa="bbb" ...${a} xxx="yyy" ...${b} ccc="ddd">Hello</div>`;

					expect(template).toMatch(/<div .* aaa="bbb"\s+data-a="a"\s+xxx="yyy"\s+data-b="b"\s+ccc="ddd">Hello<\/div>/);
				});

				it('sets them correctly with other passed-in attributes in between', () => {
					const a = { 'data-a': 'a' };
					const b = { 'data-b': 'b' };
					const number = 42;
					const template = rml`<div aaa="bbb" ...${a} xxx="${number}" ...${b} ccc="ddd">Hello</div>`;

					expect(template).toMatch(/<div .* aaa="bbb"\s+data-a="a"\s+xxx="42"\s+data-b="b"\s+ccc="ddd">Hello<\/div>/);
				});

			});

			describe('When dataset attributes are passed', () => {

				it('sets their values inline', () => {
					const args = { 'data-foo': 'bar', 'data-baz': 'qux' };
					const template = rml`<div ${args}>Hello</div>`;

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

				describe('Content', () => {
					it('renders 0 when an object has a .value of 0', () => {
						const zeroValueObject = new BehaviorSubject(0);
						const template = rml`<div>${zeroValueObject}</div>`;
						expect(template).toMatch(/<div.*>0<\/div>/);
					});
				});

				describe('Attributes', () => { 
					it('renders 0 in an attribute when an object has a .value of 0', () => {
						const zeroValueObject = new BehaviorSubject(0);
						const template = rml`<input value="${zeroValueObject}">`;
						expect(template).toMatch(/<input.* value="0">/);
					});
				});
			});

		});

	});

	describe('Plain Objects', () => {
	});
});
