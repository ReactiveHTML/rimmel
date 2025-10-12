// @ts-nocheck

/**
 * Rimmel.js Kitchen Sink Demo Application
 * 
 * You can get a running version of this code here:
 * https://stackblitz.com/~/github.com/ReactiveHTML/rimmel?file=examples/kitchen-sink/index.ts&startScript=kitchen-sink
 *
 * This is a messy testbed of all you can do with Rimmel.
 * If you're just starting out, this will feel
 * overwhelming, so you might want to start with some
 * simpler examples around.
 * 
 * Rimmel.js examples:
 * https://stackblitz.com/orgs/github/ReactiveHTML/collections/reactivity
 */

import type { HTMLString, SinkBindingConfiguration, Stream, Coords } from '../../src/index';

import { BehaviorSubject, Subject, ReplaySubject, catchError, combineLatest, filter, interval, map, merge, mergeWith, Observable, of, pipe, scan, share, startWith, take, tap, timer } from 'rxjs';

import { rml, inputPipe, pipeIn, Active, AppendHTML, AutoForm, cut, Cut, Dataset, DatasetObject, eventData, EventData, form, Form, InnerHTML, InnerText, JSONDump, Key, Numberset, OffsetXY, Passive, Removed, Sanitize, sink, source, Suspend, Suspender, Swap, AsLatestFrom, TextContent, Update, Value, ValueAsDate, ValueAsNumber, value, } from '../../src/index';
import { subscribe } from '../../src/lib/drain';
import { set_USE_DOM_OBSERVABLES } from '../../src/index';
import { char } from '../../src/types/basic';
import { RegisterElement } from '../../src/custom-element';

const log = (p) => tap(x=>console.log(p, x))
const logData = tap(console.log);
const step = tap(x => {
	debugger;
});
const upperCase = map((s: string)=>s.toUpperCase());

const defer = <T>(x: T, timeout: number = 500): Promise<T> =>
	new Promise<T>(resolve => setTimeout(resolve, timeout, x));

////////////////////////////////////////////////

const sources = {
	DOM_OBSERVABLES: () => {
		const NativeStream = () => {
			const subscribers = [];
			const o = new window.Observable(subscriber => {
				const pos = subscribers.push(subscriber);
				const unsub = () => {
					subscribers.splice(pos, 1);
				};
				unsub.unsubscribe = unsub;
				return unsub;
				// signal = observer.signal
			});
			o.next = (data) => {
				subscribers.forEach(l=>l.next ? l.next(data) : l(data));
			}
			o.error = (e) => output?.error(data);
			o.complete = () => output?.complete();
			o.subscribe = (l) => {
				const pos = subscribers.push(l);
				const unsub = () => {
					subscribers.splice(pos, 1);
				};
				unsub.unsubscribe = unsub;
				return unsub;
			}
			return o;
		}

		const input = NativeStream();
		const output = input.map(s=>s.toUpperCase());

		output.subscribe({
			next: x=>console.log('>>>', x)
		});

		const strHTML = rml`
			<input oninput="${Value(input)}">
			<div>${output}</div>
		`;

		set_USE_DOM_OBSERVABLES(true);
		setTimeout(()=>set_USE_DOM_OBSERVABLES(false), 10);
		return strHTML;
	},

	SYNC_RENDERING: () => {
		const stream = new Subject().pipe(
			startWith('initial value'),
		);

		const strHTML = rml`
			<button rml:debugger onclick="${Value(stream)}">next value</button>
			<div>${stream}</div>
		`;

		console.log('Initial HTML:', strHTML);
		return strHTML;
	},

	MULTILINE: () => {
		const id = 'xxx';
		const stream = interval(1000);

		const strHTML = rml`
			<div
				id="${id}"
				style="margin-top: ${stream}px;"
				rml:focus="${stream}"
			>
				${InnerText(stream)}
			</div>
		`;

		console.log('HTML:', strHTML);
		return strHTML;
	},

	SVG: () => {
		const stream = interval(50).pipe(
			take(21),
			map(i => `<path d="M 0,${100-10*i} 100,${10*i}">`)
		);

		const strHTML = rml`
			<svg version="1.1" viewBox="0 0 100 100">
				<g style="stroke:#0000ffff; stroke-width: .2;">${AppendHTML(stream)}</g>
			</svg>
		`;

		return strHTML;
	},

	CANVAS: () => {
		const s2 = new Subject();

		const stream = interval(2000).pipe(
			take(21),
			map(i => [[0, 100 -10*i], [100, 10*i]])
		);

		const color = new BehaviorSubject('#ff0000');
		const shadowColor = new BehaviorSubject('#0000ff');

		const strHTML = rml`
			<input type="color" oninput="${Value(color)}"> <br>
			<input type="color" oninput="${Value(color)}"> <br>

			<canvas style="width: 100%; height: 100px">
				<canvas-line color="${color}" shadow-color="${shadowColor}" path="${stream}" onxxx="${s2}" />
				<!--canvas-rect path="${stream}" onxxx="${s2}" /-->
			</canvas>
			<div>${s2}</div>
		`;

		return strHTML;
	},

	ObjectSourceImplicit: () => {
		const data = {
			prop1: undefined
		}

		const stream = new Subject().pipe(
			map(() => data.prop1) // Just emit the latest value of data.prop1 every time
		);

		return rml`
			Updating a non-reactive property of an object<br>
			<input onchange="${['prop1', data]}"><br>

			<button onclick="${stream}">check</button>
			data.prop1 = <span>${stream}</span>
		`;
	},

	ObjectSourceExplicit: () => {
		const data = {
			prop1: undefined
		};

		const stream = new Subject().pipe(
			map(() => data.prop1) // Just emit the latest value of data.prop1 every time
		);


		return rml`
			Updating a non-reactive property of an object<br>
			<input onchange="${Update('prop1', data)}"><br>

			<button onclick="${stream}">check</button>
			data.prop1 = <span>${stream}</span>
		`;
	},

	ActiveListener: () => {
		const stream = new Subject<string>().pipe(
			tap((e: Event) => {
				e.preventDefault()
			}),
			map((e: TouchEvent) => {
				return `Cancelled event: ${e}`
			}),
		);

		return rml`
			This image should not be draggable, as the ontouchstart handler should be registered active, not passive.<br>
			<img draggable="true" ontouchstart="${Active(stream)}" onmousedown="${Active(stream)}" style="width: 5cm; height: 5cm; background: purple;" alt="image">
			<div>${stream}</div>
		`;
	},

	PassiveListener: () => {
		const stream = new Subject<string>().pipe(
			tap((e: Event) => {
				e.preventDefault()
			}),
			map((e: TouchEvent) => {
				return `Cancelled event: ${e}`
			}),
		);

		return rml`
			This image should indeed be draggable, as the ontouchstart handler should be registered passive now.<br>
			<img draggable="true" ontouchstart="${Passive(stream)}" onmousedown="${Passive(stream)}" style="width: 5cm; height: 5cm; background: purple;" alt="image">
			<div>${stream}</div>
		`;
	},

	AsLatestFrom: () => {
		const otherStream = new ReplaySubject(123);
		const stream = new Subject<any>();

		setInterval(() =>
			otherStream.next(Math.random())
		, 1000);

		return rml`
			<button onclick="${AsLatestFrom(otherStream, stream)}">click me</button>
			[ <span>${stream}</span> ]
		`;
	},

	AsLatestFrom2: () => {
		const otherStream = new ReplaySubject(123);
		const stream = new Subject<any>();

		setInterval(() =>
			otherStream.next(Math.random())
		, 1000);

		const AsTheOther = AsLatestFrom(otherStream);

		return rml`
			<button onclick="${AsTheOther(stream)}">click me</button>
			[ <span>${stream}</span> ]
		`;
	},


	ValueSource: () => {
		const stream = new Subject<string>();

		return rml`
			<input type="text" oninput="${Value(stream)}" placeholder="type someting" autofocus>
			[ <span>${stream}</span> ]
		`;
	},

	ValueAsNumberSource: () => {
		const stream = new Subject<number>().pipe(
			map(x=> isNaN(x) ? '' : 2*x)
		);

		return rml`
			x : <input type="number" oninput="${ValueAsNumber(stream)}" size="3" autofocus><br>
			2x: <span>${stream}</span>
		`;
	},

	ValueAsDateSource: () => {
		const stream = new Subject<Date | null>()
		const yesterday = stream.pipe(
			map(d=> {
				d?.setDate(d.getDate() -1);
				return d?.toDateString() ?? '';
			})
		);
		const tomorrow = stream.pipe(
			map(d=> {
				d?.setDate(d.getDate() +1);
				return d?.toDateString() ?? '';
			})
		);

		return rml`
			Today is: <input type="date" oninput="${ValueAsDate(stream)}" autofocus><br>
			Yesterday: <span>${yesterday}</span><br>
			Tomorrow: <span>${tomorrow}</span><br>
		`;
	},

	Cut: () => {
		const stream = new Subject<string>();

		return rml`
			<input type="text" onchange="${Cut(stream)}" autofocus>
			[ <span>${stream}</span> ]
		`;
	},

	CutPipeline: () => {
		const stream = new Subject<string>();

		return rml`
			<input type="text" onchange="${source(logData, cut, logData, upperCase, logData, stream)}" autofocus>
			[ <span>${stream}</span> ]
		`;
	},

	UpperCut: () => {
		const stream = new Subject<string>();
		const UpperCut = inputPipe(cut, upperCase);

		return rml`
			<input type="text" onchange="${UpperCut(stream)}" autofocus>
			[ <span>${stream}</span> ]
		`;
	},

	Swap: () => {
		const stream = new Subject<string>();

		return rml`
			<input type="text" onchange="${Swap('SWAPPED', stream)}" autofocus>
			[ <span>${stream}</span> ]
		`;
	},

	Swap_Fn: () => {
		const stream = new Subject<string>();

		return rml`
			<input type="text" onchange="${Swap(v=>v.toUpperCase(), stream)}" autofocus>
			[ <span>${stream}</span> ]
		`;
	},

	Form: () => {
		const stream = new Subject<string>();

		return rml`
			<form method="dialog" onsubmit="${Form(stream)}" action="">
				<input name="field1" value="a">
				<input name="field2" value="b">
				<input name="field3" value="c">
				<button>submit</button>
				<input type="submit" value="submit">
			</form>
			Result: <span>${JSONDump(stream)}</span>
		`;
	},

	form: () => {
		const stream = new Subject<string>();

		return rml`
			<form method="dialog" onsubmit="${source(form, stream)}" action="">
				<input name="field1" value="a">
				<input name="field2" value="b">
				<input name="field3" value="c">
				<button>submit</button>
				<input type="submit" value="submit">
			</form>
			Result: <span>${JSONDump(stream)}</span>
		`;
	},

	AutoForm: () => {
		const stream = new Subject<string>();

		return rml`
			<form method="dialog" onsubmit="${AutoForm(stream)}" action="" oninput="${AutoForm(stream)}" onchange="${AutoForm(stream)}" rml:onmount="${AutoForm(stream)}">

				<input name="text1" value="foo" autofocus> <br>
				<input name="num1" type="number" value="123"> <br>
				<input name="date1" type="date" value="2025-01-01"> <br>
				<input name="color1" type="color" value="#ff8800"> <br>
				<input name="hidden1" type="hidden" value="100" data-type="number"> <br>

				<input name="check1" type="checkbox" value="12345" checked> <br>

				<select name="select1" data-type="number">
					<option value="1">1</option>
					<option value="2">2</option>
					<option value="3">3</option>
				</select> <br>

				<select name="select2" data-type="number">
					<option value="1">1</option>
					<option value="2">2</option>
					<option value="3">3</option>
				</select> <br>

				<select name="multiselect1" multiple format="number">
					<option value="1"          data-type="number">1</option>
					<option value="2024/12/31" data-type="date" selected>2</option>
					<option value="3"          data-type="string" selected>3</option>
				</select> <br>

				<input name="radio1" type="radio" data-type="number" value="1"> One<br>
				<input name="radio1" type="radio" data-type="number" value="2"> Two<br>
				<input name="radio1" type="radio" data-type="number" value="3" checked> Three<br>


				<button>submit</button>
				<input type="submit" value="submit">
			</form>
			Result: <span>${JSONDump(stream)}</span>
		`;
	},


	pipeIn: () => {
		const stream = new Subject<string>();

		const LOG = tap(console.log);
		const VALUE = map((e: Event)=>(<HTMLInputElement>e.target).value);
		const UPPER = map((s: string)=>s.toUpperCase());
		const UNDERLINE = map((s: string)=>s.split('').join('_'));

		return rml`
			Stream: <span>${stream}</span><br>
			<input oninput="${pipeIn<Event, string>(stream, VALUE, UNDERLINE, UPPER, LOG)}">
		`;
	},

	inputPipe: () => {
		const stream = new Subject<string>();

		const LOG = tap(console.log);
		const VALUE = map((e: Event)=>(<HTMLInputElement>e.target).value);
		const UPPER = map((s: string)=>s.toUpperCase());
		const UNDERLINE = map((s: string)=>s.split('').join('_'));

		const UNDERSPLIT = inputPipe<Event, string>(VALUE, UNDERLINE, UPPER, LOG);

		return rml`
			Stream: <span>${stream}</span><br>
			<input oninput="${UNDERSPLIT(stream)}" autofocus>
		`;
	},


	Dataset: () => {
		const stream = new Subject<string>();

		return rml`
			<button data-foo="bar" onclick="${Dataset('foo', stream)}">click me</button>
			<br>
			data-foo = <span>${stream}</span>
		`;
	},


	Dataset_Curried: () => {
		const stream = new Subject<string>();
		const JustFoo = Dataset('foo');

		return rml`
			<button data-foo="bar" onclick="${JustFoo(stream)}">click me</button>
			<br>
			data-foo = <span>${stream}</span>
		`;
	},

	DatasetObject: () => {
		const stream = new Subject<string>();

		return rml`
			<button data-foo="bar" data-baz="bat" onclick="${DatasetObject(stream)}">click me</button>
			<br>
			dataset = <span>${sink(stream, JSONDump)}</span>
		`;
	},

	NumbersetSource: () => {
		const JustTheAmount = Numberset('amount');
		const count = <Subject<number>>new BehaviorSubject(0).pipe(
			scan((a, b)=>a+b)
		);


		return rml`
			<button onclick="${JustTheAmount(count)}" data-amount="-1"> - </button>
			<input type="text" value="${count}" size="3">
			<button onclick="${JustTheAmount(count)}" data-amount="1" > + </button>
		`;
	},

	OffsetXYSource: () => {
		type coords = [number, number];
		const stream = new Subject<coords>().pipe(
			map(([x, y]) => `x: ${x}; y: ${y}`)
		);

		return rml`
			<div onmousemove="${OffsetXY(stream)}" style="background-color: #ffff80; padding: 3rem; cursor: crosshair;">
				<div>Mouse me over!</div>
				<div>Coords: <span>${stream}</span></div>
			</div>
		`;
	},

	'EventData': () => {
		const stream = new Subject<char>();

		return rml`
			<input oninput="${EventData(stream)}" style="background-color: #ffff80; padding: 3rem;">
			<div>Last key pressed: <strong>${stream}</strong></div>
		`;
	},

	'eventData': () => {
		const stream = new Subject<char>();

		return rml`
			<input oninput="${source(eventData, stream)}" style="background-color: #ffff80; padding: 3rem;">
			<div>Last key pressed: <strong>${stream}</strong></div>
		`;
	},


	'KeyboardSource_(Key)': () => {
		const stream = new Subject<char>();

		return rml`
			<input onkeydown="${Key(stream)}" style="background-color: #ffff80; padding: 3rem;">
			<div>Last key pressed: <strong>${stream}</strong></div>
		`;
	},

	UndefinedSource: () => {
		const empty = undefined;

		return rml`
			Handler is undefined — nothing should happen.<br>
			<button onclick="${empty}">click me</button>
		`;
	},

}

const sinks = {
	EmptyString: () => {
		return rml``;
	},

	StaticNumber: () => {
		return rml`<div>${123}</div>`;
	},

	StaticZero: () => {
		return rml`<div>${0}</div>`;
	},

	StaticString: () => {
		return rml`<div>${'hello'}</div>`;
	},

	StaticNull: () => {
		return rml`<div>${null}</div>`;
	},

	StaticNullString: () => {
		return rml`<div>${'null'}</div>`;
	},

	StaticUndefined: () => {
		return rml`<div>${undefined}</div>`;
	},

	StaticUndefinedString: () => {
		return rml`<div>${'undefined'}</div>`;
	},

	AlertButton: () => {
		return rml`<button onclick="${()=>alert('clicked')}">click me</button>`
	},

	BehaviorSubject: () => {
		const bs = new BehaviorSubject('initial').pipe(
			mergeWith(interval(1000)),
		);

		return rml`Output: <span>${bs}</span>`;
	},

	ClassSink: () => {
		const cls1 = 'cls1';
		const cls2 = defer('cls2', 1000);
		const cls3 = defer('cls3', 2000);
		const cls4 = defer('cls4', 3000);

		return rml`
			<style>
				.cls1 .cls1 {
					text-shadow: 0px 0px 2px goldenrod;
				}
				.cls2 .cls2 {
					color: limegreen;
				}
				.cls3 .cls3 {
					font-weight: bold;
				}
				.cls4 .cls4 {
					font-style: italic;
				}
				.cls5 .cls5 {
					text-decoration: underline;
				}
			</style>
			<div class="cls1">
				should be <span class="cls1">glowing</span>
			</div>
			<div class="${cls2}">
				should go <span class="cls2">green</span>
			</div>
			<div class="cls1 ${cls2} cls3 ${cls4} cls5">
				should turn <span class="cls1">glowing</span>, <span class="cls2">green</span>, <span class="cls3">bold</span>, <span class="cls4">italic</span>, then <span class="cls5">underlined</span>
			</div>
		`;
	},

	CustomElement: () => {
		const notify = (key: string) => void console.log('Notify', key);

		const titleStream = interval(1000).pipe(
			map(i => `title ${i}`),
		);

		return rml`
			Should be a custom element
			<p class="colored">colored</p>
			<custom-element class="css-through" style="--color: lime" title="${titleStream}" content="lime" data-foo="bar2" oninput="${EventData(notify)}" onclick="${Dataset('foo')(notify)}" />
		`;
	},

	CustomElement2: () => {
		const notify = (key: string) => void console.log('Notify', key);
		const Foo = Dataset('foo');

		const titleStream = interval(100).pipe(
			map(i => `title ${i}`),
		);

		return rml`
			Should be a custom element
			<custom-element class="css-through" title="${titleStream}" style="--color: blue" content="blue" data-foo="bar2" oninput="${EventData(notify)}" onclick="${Foo(notify)}" />
		`;
	},

	CustomElement3: () => {
		const notify = (key: string) => void console.log('Notify', key);

		const titleStream = interval(100).pipe(
			map(i => `title ${i}`),
		);

		return rml`
			Should be a custom element
			<custom-element title="${titleStream}" content="Hello, injected content" data-foo="bar2" onput="${notify}" onbuttonclick="${notify}" />
		`;
	},

	ShadowDOMElement: () => {
		return rml`
			Should create a web component with a reactive Shadow DOM and elements created after mounting that are still reactive
			<custom-shadowdom-element />
		`;
	},

	EventDelegation: () => {
		const n = new BehaviorSubject<number>(0);

		const count = n.pipe(
			scan((acc, input) => acc +input)
		);

		const justButtons = filter((e: Event) => (<HTMLElement>e.target).tagName == 'BUTTON');
		const innerText = map((e: Event) => (<HTMLElement>e.target).innerText);
		const toNumber = map((s: string) => Number(s));

		return rml`
			<div onclick="${source(justButtons, innerText, toNumber, n)}">
				<button>1</button>
				<button>2</button>
				<button>3</button>
				<button>4</button>
				<button>5</button>
				<hr>
				Result: <span>${count}</span>
			</div>
		`;
	},

	StyleValueSync: () => {
		const bg = 'green';

		return rml`
			<div style="background: clay; color: ${bg}; padding: 1rem;">
				Should be green
			</div>
		`;
	},

	StyleValueAsync: () => {
		const bg = defer('maroon', 500);
		const textDeco = defer('underline', 1000);
		const size = defer('140%', 1500);
		const rest = defer({
			rotate: '20deg',
			opacity: .5,
		}, 2000)

		return rml`
			<div style="background: #f0c0b0; color: ${bg}; text-decoration: ${textDeco}; padding: 1rem; font-size: ${size}; ${rest}; font-family: monospace;">
				Should turn maroon, underlined, large, rotated, translucent
			</div>
		`;
	},

	FocusSink: () => {
		const altern = interval(500).pipe(
			scan(x => !x, false),
		)

		return rml`
			Focus/Blur
			<input rml:focus="${altern}">
		`;
	},

	BlurSink: () => {
		const keyStream = new Subject();
		const blur = keyStream.pipe(
			log('KEY'),
			filter(k => k == 'Enter')
		);

		return rml`
			Type some text and hit Enter to blur<br>
			<input rml:blur="${blur}" onkeydown="${Key(keyStream)}">
		`;
	},

	Mixin1: () => {
		const counter = new BehaviorSubject(0).pipe(
			scan(x=>x+1),
		);

		const mixin1 = (args?: any) => {
			const dataset = {
				foo: 'foo',
				bar: defer('bar'),
			};

			const classObject = {
				class1: defer(true),
				class2: false,
			};

			const style = {
				color: 'red',
				font: defer('24px monospace', 1000),
			};

			const events = {
				onmouseover: () => console.log('mouseover'),
				onmouseout: () => console.log('mouseout'),
			};

			return {
				dataset,
				'data-deferred': defer('deferred'),
				class: classObject,
				style,
				...events,
			};
		};

		return rml`
			<style>
				.mx::before {
					content: attr(data-hello);
				}
				.mx::after {
					content: attr(data-foo);
				}
			</style>
			<div class="mx" ...${mixin1()}>
				with mixin1()
				<button type="button" onclick="${counter}"> Click me </button><br>
				You clicked the button <span>${counter}</span> times.
			</div>
		`
	},

	Mixin2Promise: () => {
		const counter = new BehaviorSubject(0).pipe(
			scan(x=>x+1),
		);

		const mixin1 = async (args?: any) => {
			const dataset = {
				hello: 'world',
				// test: () => 123, // TS error ;)
				foo: defer('bar'),
			};

			const classObject = {
				class1: true,
				class2: false,
				class3: defer(true),
			};

			const style = {
				color: 'red',
				font: defer('24px monospace'),
			};

			const events = {
				onmouseover: () => console.log('mouseover'),
				onmouseout: () => console.log('mouseout'),
			};

			await defer(1000);

			return {
				dataset,
				'data-deferred': defer('deferred'),
				class: classObject,
				style,
				...events,
			};
		};

		return rml`
			<div ...${mixin1()}>
				with mixin1()
				<button type="button" onclick="${counter}"> Click me </button><br>
				You clicked the button <span>${counter}</span> times.
			</div>
		`;
	},

	Mixin3: () => {
		const Mixin2 = (args?: any) => {
			const dataset = new Subject();
			const classObject = new Subject();
			const style = new Subject();
			const events = new Subject();
			const innerHTML = new Subject();

			setTimeout(() => {
				dataset.next({
					hello: 'world',
					foo: 'bar',
					deferred: 'deferred data',
				});

				classObject.next({
					class1: true,
					class2: false,
				});

				style.next({
					color: 'red',
					font: '20px monospace',
				});

				events.next({
					onclick: () => alert('mouseover'),
					onmouseout: () => console.log('mouseout'),
				});

				innerHTML.next('Replaced!');
			}, 1000)

			return {
				dataset,
				class: classObject,
				style,
				events,
				innerHTML,
			};
		};

		return rml`
			<div ...${Mixin2()}>
				with Mixin2()
			</div>
		`;
	},

	Mixin_Subtree: () => {
		const counter = timer(0, 1000);

		const mix = (args?: any) => {
			const subtree = {
				'.grandchild span': {
					innerHTML: counter,
					style: {color: 'red'},
				}
			};

			return {
				subtree,
			};
		};

		return rml`
			<div ...${mix()}>
				<div class="child">
					Child element
					<div class="grandchild">
						Grandchild element <span />
					</div>
					<div class="grandchild">
						Grandchild element <span />
					</div>
				</child>
			</div>
		`
	},

	'Mixin (multiple)': () => {
		const counter = timer(0, 1000);

		const mix = (source: Observable<any>) => {
			return {
				innerHTML: source,
			};
		};

		const colors = (source: Observable<any>) => {
			return {
				style: {
					color: interval(200).pipe(map(i => `#80${Math.round((255*Math.random())).toString(16).padStart(2, '0')}80`)),
				}
			};
		};

		return rml`
			<div ...${mix(counter)} ...${colors()}>
			</div>
		`
	},

	'Mixin (multiple2)': () => {
		const counter = timer(0, 1000);

		const mix = (source: Observable<any>) => {
			return {
				innerHTML: source,
			};
		};

		const colors = (source: Observable<any>) => {
			return {
				style: {
					color: interval(200).pipe(map(i => `#80${Math.round((255*Math.random())).toString(16).padStart(2, '0')}80`)),
				}
			};
		};

		return rml`
			<div foo="bar" ...${mix(counter)} baz="bat" ...${colors()}>
			</div>
		`
	},

	'Mixin (aaa)': () => {
		const a = { 'data-foo': 'bar' };
		const b = defer({ 'data-bar': 'baz' });
		return rml`<div ...${a} rml:debugger ...${b}>Hello</div>`;
	},


	'Mixin (mixed)': () => {
		const quz = defer('quz');
		const obj = { 'data-foo': 'bar', 'data-baz': quz };

		return rml`<div rml:debugger ...${obj}>Hello</div>`;
	},

	'Mixin (mixed2)': () => {
		const a = defer({ 'data-foo': 'bar' });
		return rml`<div rml:debugger ...${a}>Hello</div>`;
	},

	'Removed (Implicit)': () => {
		const removed = new Subject<Event>();

		return rml`
			<div rml:removed="${removed}">
				Removed (Implicit) sink
				<button onclick="${removed}">Remove</button>
			</div>
		`
	},

	'Removed (Implicit Mixin)': () => {
		const removed = new Subject().pipe(
			map(() => ({
				'rml:removed': true,
				'class': 'removed',
			})),
		);

		return rml`
			<div ...${removed}>
				Removed (Implicit Mixin) sink
				<button onclick="${removed}">Remove</button>
			</div>
		`;
	},

	'Removed (Implicit Mixin, async)': () => {
		const removed = new Subject().pipe(
			map(() => ({
				'rml:removed': defer(true),
				'class': 'removed',
			})),
		);

		return rml`
			<div ...${removed}>
				Removed (Implicit Mixin) sink
				<button onclick="${removed}">Remove</button>
			</div>
		`;
	},

	'Removed (Explicit Mixin)': () => {
		const removed = new Subject<boolean>();

		return rml`
			<div ...${Removed(removed)}>
				Removed (Implicit Mixin) sink<br>
				<button onclick="${removed}">Remove</button>
			</div>
		`;
	},

	'Attribute (Implicit)': () => {
		const stream = defer('bar');

		return rml`
			Attribute sink <br>
			<style>
				.pqpqpq::after {
					content: attr(foo);
					margin: 0 1rem;
					color: green;
				}
			</style>
			<span class="pqpqpq" foo="${stream}">foo...</span>
		`;
	},

	'Attribute (Mixin)': () => {
		const stream = defer({foo: 'bar'});

		return rml`
			Attribute sink <br>
			<style>
				.pqpqpq::after {
					content: attr(foo);
					margin: 0 1rem;
					color: green;
				}
			</style>
			<span class="pqpqpq" ...${stream}>foo...</span>
		`;
	},

	'Dataset (static)': () => {
		const stream = {'data-foo': 'bar'};

		return rml`
			Static Dataset attributes<br>
			<style>
				.display::after {
					content: attr(data-foo);
					margin: 0 1rem;
					color: green;
				}
			</style>
			<span class="display" ...${stream}>data-foo:</span>
		`;
	},

	'Dataset (deferred)': () => {
		const stream = defer({'data-foo': 'bar'});

		return rml`
			Static Dataset attributes<br>
			<style>
				.display::after {
					content: attr(data-foo);
					margin: 0 1rem;
					color: green;
				}
			</style>
			<span class="display" ...${stream}>data-foo:</span>
		`;
	},

	'Dataset (camelCase)': () => {
		const stream = {'data-foo-bar': 'baz'};
		const check = (e: Event) => alert(e.target.dataset.fooBar);

		return rml`
			Static Dataset attributes<br>
			<style>
				.display::after {
					content: attr(data-foo);
					margin: 0 1rem;
					color: green;
				}
			</style>
			<span class="display" ...${stream} onmount="${check}">data-foo-bar:</span>
		`;
	},


	Confusions: () => {
		const disabled = false;
		return rml`
			<button rml:disabled="${disabled}">disabled=${disabled}</button>
		`;
	},


	SyncDisabled__: () => {
		const disabled = false;
		const click = new Subject().pipe(
			scan(x => x+1, 0),
		);

		return rml`
			<button disabled="${disabled}"  onclick="${click}">disabled ${disabled}</button>
			<button disabled="${!disabled}" onclick="${click}">disabled ${disabled}</button>
			<br><br>
			<div>Clicked? <span>${click}</span></div>
		`;
	},

	AsyncDisabled: () => {
		const toggle = interval(1000).pipe(
			scan(x=>!x, false)
		);

		return rml`
			Async disabled sink
			<button disabled="${toggle}">disabled stream</button>
		`;
	},

	AsyncReadonly: (t = 2000) => {
		const toggle = interval(1000).pipe(
			scan(x=>!x, false)
		);

		return rml`
			Async readonly sink
			<input readonly="${toggle}" value="toggle .readonly">
		`
	},

	Hidden: (t = 2000) => {
		const toggle = interval(1000).pipe(
			scan(x=>!x, false)
		);

		return rml`
			Async hidden sink
			<input hidden="${toggle}" value="toggle hidden">
		`
	},


	AsyncDialogToggle: (t = 1000) => {
		const open$ = new Subject().pipe(
			scan(x=>!x)
		);

		return rml`
			Async dialog toggle sink
			<dialog open="${open$}">
				<p>dialog content</p>
			</dialog>
			<button onclick="${open$}">toggle</button>
		`;
	},

	AsyncDialogOpen: (t = 1000) => {
		const open$ = new Subject().pipe(
			map(_=>true)
		);
		const close$ = new Subject().pipe(
			map(_=>false)
		);
		const remove = new Subject();
		const toggle = merge(open$, close$);

		return rml`
			Async dialog open sink
			close and destroy (can't reopen)
			<dialog open="${toggle}" rml:removed="${remove}">
				<p>dialog content</p>
				<button onclick="${close$}">close</button>
				<button onclick="${remove}">remove</button>
			</dialog>
			<button onclick="${open$}">open</button>
			<button onclick="${close$}">close</button>
			<button onclick="${remove}">remove</button>
		`;
	},

	'AppendHTML (Explicit)': () => {
		const counter = interval(500).pipe(
			map(i=> `INTERVAL => ${i}<br>` as HTMLString)
		);

		return rml`
			Explicit AppendHTML sink
			<div>${AppendHTML(counter)}</div>
		`;
	},

	'InnerHTML (Implicit)': () => {
		const counter = interval(500).pipe(
			map(i=> `INTERVAL => ${i}`)
		);

		return rml`
			Simple content sink
			<div>${
				counter
			}</div>
		`;
	},

	'InnerHTML (Explicit)': () => {
		const counter = interval(500).pipe(
			map(i=> <HTMLString>`INTERVAL => ${i}`)
		);

		return rml`
			Explicit InnerHTML sink
			<div>${InnerHTML(counter)}</div>
		`;
	},

	ExplicitInnerText: () => {
		const counter = interval(500).pipe(
			map(i=> <HTMLString>`<strong>INTERVAL</strong> => ${i}`)
		);

		return rml`
			Explicit InnerText sink
			<div>${InnerText(counter)}</div>
		`;
	},

	OnMount: () => {
		const onmount = () => alert('onmount callback');

		return rml`
			<div onmount="${onmount}">do on mount</div>
		`;
	},

	RMLOnMount: () => {
		const onmount = () => alert('rml:onmount callback');

		return rml`
			<div rml:onmount="${onmount}">do on mount</div>
		`;
	},

	OnPlay: () => {
		const handler = () => alert('play');

		return rml`
			<video controls onplay="${handler}" style="max-width: 50%;">
				<source src="./flower.webm" type="video/webm" />
			</video>
		`;
	},

	TextContentExplicit: () => {
		const stream = interval(500);

		return rml`
			<div>
				${TextContent(stream)}
			</div>
		`;
	},

	TextNodes: () => {
		const stream = interval(500);
		const stream2 = new BehaviorSubject(0).pipe(
			scan(x=>x+1)
		);

		return rml`
			<div>
				Timer: ${stream}
				Count: ${stream2}
			</div>
			<button onclick="${stream2}">click</button>
		`;
	},

	OtherTextNodes: () => {
		const stream = interval(500);
		const stream2 = new BehaviorSubject(0).pipe(
			scan(x=>x+1)
		);

		return rml`
			<button onclick="${stream2}">click</button>
			<div style="white-space: pre-line">
				Hello

				Timer: ${stream}
				Count: ${stream2}${stream2} ${stream2} :-: ${stream2}

				Bye
			</div>
		`;
	},

	Suspend: () => {
		const i = interval(1000);
		return rml`
			<div>
				${Suspend('Waiting...', i)}
			</div>
		`;
	},

	Suspender_Streams: () => {
		const stream = interval(1000);
		const loader = Suspender('Waiting...');
		return rml`
			<div>
				${loader(stream)}
			</div>
		`;
	},

	Suspender_Promises: () => {
		const stream = new Promise(r => setTimeout(()=>r('Done'), 1000));
		const loader = Suspender('Waiting...');
		return rml`
			<div>
				${loader(stream)}
			</div>
		`;
	},

	Array: () => {
		const children = [
		'foo', 'bar', 'baz', 'bat', 'bam'
		];

		return rml`
			<ol>
			${
				children.map(str =>
					rml`<li>${str}</li>`
				)
			}
			</ol>
		`;
	},

	StreamsArray: () => {
		const children = [...Array(5)]
			.map((_, i)=>interval((i+1)*100))
		;

		return rml`
			<ol>
			${
				children.map(str =>
					rml`<li>${str}</li>`
				)
			}
			</ol>
		`;
	},

	PromisesArray: () => {
		const children = [...Array(10)]
			.map((_, i)=>defer(i +1, (i+1)*100))
		;

		return rml`
			<ol>
			${
				children.map(str =>
					rml`<li>${str}</li>`
				)
			}
			</ol>
		`;
	},

//	Sanitize: () => {
//		const Sanitize = (input: Observable<string>) => ({
//			type: 'sink',
//			source: input.pipe(
//				map(strHTML => strHTML.replace(/</g, '&lt;'))
//			),
//			sink: InnerHTMLSink
//		});
//
//		const stream = of('<script>alert("evil")</script>');
//
//		return rml`
//			<div>${Sanitize(stream)}</div>
//		`;
//	},

	Sanitize1: () => {
		const stream = of(<HTMLString>`<div>
			Dirty code
			<script>alert("evil")</script>
			<img onload="alert('hack')" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZmlsbD0icmVkIiBkPSJNNTAgMTAwYTUwIDUwIDAgMSAwIDAtMTAwIDUwIDUwIDAgMCAwIDAgMTAwWiIvPjwvc3ZnPg==" width="10" height="10" />
			</div>
		`);

		return rml`
			<div>${Sanitize(stream)}</div>
		`;
	},

	Sanitize2: () => {
		const fn = () => alert('hack');
		const stream = of(<HTMLString>rml`
			<div>
				Dirty code
				<script>alert("evil")</script>
				<img onload="alert('hack')" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZmlsbD0icmVkIiBkPSJNNTAgMTAwYTUwIDUwIDAgMSAwIDAtMTAwIDUwIDUwIDAgMCAwIDAgMTAwWiIvPjwvc3ZnPg==" width="10" height="10" />
				<button onload="alert('hack')" onclick="${fn}">click</button>
			</div>
		`);

		return rml`
			<div>${Sanitize(stream)}</div>
		`;
	},

	CustomSink: () => {
		const Animate: SinkBindingConfiguration<HTMLElement> = (input: Observable<any>) => ({
			type: 'sink',
			source: input,
			sink: (node: HTMLElement) => {
				node.style.display = 'inline-block';
				return (data: any) => {
					node.style.transformOrigin = 'center center';
					node.animate([
						{ transform: "rotate(0turn) scale(1)" },
						{ transform: "rotate(1turn) scale(0)" },
					],{
						duration: 1000,
						iterations: 1,
					});
				};
			}
		});

		const stream = new Subject<any>();

		return rml`
			<div>
				Blah
				<div ...${Animate(stream)}>Animated bit</div>
			</div>

			<button onclick="${stream}">animate</button>
		`;
	},
	
	Glitches: () => {
		const A = interval(1000).pipe(
			log('A'),
			share(), // just to avoid double-logging "A"
		);

		const B = A.pipe(map(x=>x));
		const C = A.pipe(map(x=>x));

		// With glitches
		const D = combineLatest([B, C]).pipe(
			log('D'),
		);

		return rml`
			A: <span style="font-size: 60px;">${InnerText(A)}</span> <br>
			D (with glitches?): <span style="font-size: 60px;">${InnerText(D)}</span> <br>
			D (with glitches?): <span style="font-size: 60px;">${InnerText(D)}</span> <br>
			D (with glitches?): <span style="font-size: 60px;">${InnerText(D)}</span> <br>
			D (with glitches?): <span style="font-size: 60px;">${InnerText(D)}</span> <br>
			D (with glitches?): <span style="font-size: 60px;">${InnerText(D)}</span> <br>
			D (with glitches?): <span style="font-size: 60px;">${InnerText(D)}</span> <br>
		`;
	},

	BigTable: () => {
		const start = performance.now();
		const stream = interval(0).pipe(
			scan(x=>x+1, -1),
			tap((x) => {
				x == 100 && console.log('1k', performance.now()-start);
			}),
			share(), // This is needed, so the whole observable pipeline is not re-run deeply every time.
		);

		const rows = [...Array(50)];
		const cols = [...Array(50)];

		return rml`
			<p>Testing ${rows.length *cols.length} observable subscriptions concurrently updating table cells in Rimmel.js</p>

			<table style="font-size: 22px !important;">
				${rows.map(row=>rml`
					<tr>${cols.map(col=>rml`
						<td>${InnerText(stream)}</td>
					`).join('')}
					</td>
				`).join('')}
			</table>
		`;
	},

	ErrorHandling: () => {
		// Error Catcher Sink
		const Catch = (stream: Observable<any>, handler: (e: Error) => HTMLString | string) => 
			stream.pipe(
				catchError((err: Error) => of(handler(err)))
			)
		;

		// Countdown Source Mapper
		const CountDown = (stream: Observable<any>, limit: number) =>
			pipeIn(stream,
				scan((a, _b) => a-1, limit),
			);

		// Main State stream
		const stream = new Subject().pipe(
			map(count => {
				if (count == 0) {
					throw new Error('Synthetic Error');
				}
				return count
			}),
		);

		return rml`
			<button onclick="${CountDown(stream, 5)}">Next</button><br>
			Output:<br>
			<div>${Catch(Suspend(5, stream), e => `Caught: ${e.message}`)}</div>
		`;
	},

	Completion: () => {
		const stream = new Subject().pipe(
			startWith('only value'),
			take(1),
		);

		return rml`
			Closing stream
			<div>${stream}</div>
		`;
	},
}

const component = () => {

	const chosen = new Subject<[object, string]>();

	const chosenSource = chosen.pipe(
		map(([testCollection, x])=>testCollection[x]),
	);

	const chosenComponent = chosenSource.pipe(
		map(src=>src()),
	);

	const logger = new Subject();
	logger.subscribe(x=>{
		console.log('>>>>>', x)
	})

	const Tooltip = (str) => String(str)
		.replace(/"/g, "''")

	const autorun = (e: Event) => {
		e.target.querySelector(':target')?.click();
	}

	return rml`
		<style>
			* {
				font-size: 16px;
			}

			body {
			}

			code {
				display: block;
				margin: 1rem;
				padding: 1rem;
				overflow-x: auto;
				background-color: #e0e0e0;
				border-radius: .4rem;
				font-family: monospace;
				white-space: pre;
				tab-size: 2;

				&::before {
					display: block;
					margin-bottom: 1rem;
					content: "Code";
					border-bottom: 2px solid;
				}
			}

			.rendered {
				margin: 1rem;
				padding: 1rem;
				background-color: #e0e0e0;
				border-radius: .4rem;

				&::before {
					display: block;
					margin-bottom: 1rem;
					content: "Rendered";
					border-bottom: 2px solid;
				}
			}

			@media(prefers-color-scheme: dark) {
				body, code {
					background: #333;
					color: #aaa;
				}

				button {
					background: #ccc;
					color: #222;
				}
			}

			.selector {
				display: flex;
				flex-direction: row;
				overflow-x: auto;

				ul {
					display: flex;
					flex-direction: row;
					margin: 0;
					padding: 0;
					gap: .4rem;

					a {
						white-space: nowrap;
					}
				}

			}

			.twocol {
				flex: 1;
				display: grid;
				align-items: start;
				grid-template-columns: 1fr 1fr;
				gap: 1rem;
			}

			.tworow {
				flex: 1;
				display: grid;
				align-items: start;
				grid-template-rows: 1fr 1fr;
				gap: 1rem;
			}

			li {
				margin-block: .2rem;
			}

			.red {
				color: red;
			}

			custom-element .red {
				color: blue;
			}

			.class1::before {
				display: inline-block;
				content: attr(data-deferred);
				padding: 2px 6px;
				color: white;
				background-color: black;
			}

			.class3 {
				font-weight: bold;
			}

			input:read-only {
				color: #999;
			}

			a.btn {
				display: inline-block;
				padding: .2rem .4rem;
				background-color: #eee;
				color: #222;
				border-radius: 2px;
				border: 1px solid #777;
				font-family: system-ui;
				font-size: 80%;
				text-decoration: none;
			}

			a.btn:target,
			button:active,
			button:focus {
				display: inline-block;
				background-color: #333;
				color: #ccc;
			}

			@media(prefers-color-scheme: dark) {
				a.btn {
					background-color: #222;
					color: #eee;
				}

				a.btn:target,
				button:active,
				button:focus {
					background-color: #33e;
					color: #111;
				}
			}

		</style>

		<div class="output" rml:onmount="${autorun}">
			<div class="selector twocol">
				<fieldset>
					<legend>Sources</legend>
					<ul style="list-style-type: none;">
					${
						Object.keys(sources).map((t, i, tests)=>rml`
							<li><a class="btn" id="${t}" href="#${t}" title="${Tooltip(tests[t])}" onclick="${pipeIn(chosen, map(()=>[sources, t] as [object, string]))}">${t}</a></li>
						`).join('')
					}
					</ul>
				</fieldset>

				<br>

				<fieldset>
					<legend>Sinks</legend>
					<ul style="max-height: 50vh; overflow: visible; column-count: 3; list-style-type: none;">
					${
						Object.keys(sinks).map((t, i, tests)=>rml`
							<li><a class="btn" id="${t}" href="#${t}" title="${Tooltip(tests[t])}" onclick="${pipeIn(chosen, map(()=>[sinks, t] as [object, string]))}">${t}</a></li>
						`).join('')
					}
					</ul>
				</fieldset>
			</div>

			<div class="rendered">${chosenComponent}</div>

			<code>${InnerText(chosenSource)}</code>
		</div>

	`;
}

RegisterElement('custom-shadowdom-element', () => {
	const data = new Subject<string>().pipe(
		map(data=>{
			const rm = new Subject<string>;
			return rml`<button onclick="${rm}" rml:removed="${rm}">${data}</button>`
		}),
	);

	return rml`
		<div class="cls1">
			Custom Element with Reactive Shadow DOM!<br>
			<input onchange="${Cut(data)}">
			<br>
			Output (buttons should disappear when clicked): <span>${AppendHTML(data)}</span>
		</div>
	`;
});

RegisterElement('custom-element', ({ title, content, onbuttonclick, onput }) => {
	const internalPut = new Subject();
	const handle = e => {
		console.log('Internal event', e);
		onput.next(e);
		internalPut.next(e);
	};

	return rml`
		<div class="cls1">
			<style>
			:host {
			}
			:host-context(.css-through) {
				.colored {
					color: var(--color);
				}
			}
			</style>
			<h3>${title}</h3>
			<p class="colored">${content}</p>
			Custom Element Works!<br>
			<input type="text" class="colored" onchange="${Value(handle)}">
			<button type="button" data-foo="bar1" onclick="${Dataset('foo', handle)}">click me</button>
			<br>
			internal: <span>${internalPut}</span>
		</div>
	`;
});

RegisterElement('canvas-line', null, (element: Element, { color, path }) => {
	const canvas = element.closest('canvas');
	const ctx = canvas.getContext('2d');
	color.subscribe(c=>ctx.strokeStyle = c);
	ctx.lineWidth = 5;

	path.subscribe(([from, to]) => {
		ctx.beginPath();
		ctx.moveTo(...from);
		ctx.lineTo(...to);
		ctx.stroke();
	});
});

RegisterElement('canvas-rect', null, (element: Element, { path }) => {
	const canvas = element.closest('canvas');
	const ctx = canvas.getContext('2d');
	ctx.strokeStyle = '#60202080';

	path.subscribe(([from, to]) => {
		ctx.fillRect(...from, ...to);
		ctx.stroke();
	});
});


document.body.innerHTML = component();

