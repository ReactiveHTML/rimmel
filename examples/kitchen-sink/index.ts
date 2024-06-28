import type { HTMLString, Mixin } from '../../src/index';

import { BehaviorSubject, Subject, interval, map, of, scan, startWith, switchMap, take, throwError, withLatestFrom } from 'rxjs';
import { AppendHTML, InnerText, InnerHTML, InnerHTMLSink, Removed, TextContent, Update, rml } from '../../src/index';
import { Value, ValueAsNumber, Dataset, EventData, Key, MouseCoords, Numberset, pipeIn } from '../../src/index';

// const defer = (...x: any) => new Promise<typeof x>((resolve, reject) => setTimeout(resolve, 5000, ...x));
const defer = <T>(x: T): Promise<T> => new Promise<T>(resolve => setTimeout(resolve, 500, x));

////////////////////////////////////////////////

const sources = {
	UpdateSourceImplicit: () => {
		const stream = new Subject();

		const data = {
			prop1: undefined
		}
		return  rml`
			<input type="text" value="" onchange="${[data, 'prop1']}"><br>
			<button onclick="${()=>stream.next(data.prop1)}">check</button>
			<div>${stream}</div>
		`;
	},

	UpdateSourceExplicit: () => {
		const stream = new Subject();
		const data = {
			prop1: undefined
		}

		window.data = data;

		return  rml`
			<input type="text" onchange="${Update(data, 'prop1')}"><br>

			<button onclick="${()=>stream.next(data.prop1)}">check</button>
			<div>${stream}</div>
		`;
	},

	ValueSource: () => {
		const stream = new Subject<string>();

		return  rml`
			<input type="text" oninput="${Value(stream)}" placeholder="type someting" autofocus> [ <span>${stream}</span> ]
		`;
	},

	ValueAsNumberSource: () => {
		const stream = new Subject<number>().pipe(
			map(x=>2*x)
		);

		return  rml`
			x : <input type="number" oninput="${ValueAsNumber(stream)}" size="3" autofocus><br>
			2x: <span>${stream}</span>
		`;
	},

	DatasetSource: () => {
		const stream = new Subject<string>();

		return  rml`
			<button data-foo="bar" onclick="${Dataset(stream, 'foo')}">click me</button>
			<br>
			data-foo = <span>${stream}</span>
		`;
	},

	NumbersetSource: () => {
		const count = <Subject<number>>new BehaviorSubject(0).pipe(
			scan((a, b)=>a+b, 0)
		);

		return rml`
			<button onclick="${Numberset(count, 'amount')}" data-amount="-1"> - </button>
			<input type="text" value="${count}" size="3">
			<button onclick="${Numberset(count, 'amount')}" data-amount="1" > + </button>
		`;
	},

	PointerCoordsSource: () => {
		type coords = [number, number];
		const stream = new Subject<coords>().pipe(
			map(([x, y]) => `x: ${x}; y: ${y}`)
		);

		return rml`
			<div onmousemove="${MouseCoords(stream)}" style="background-color: #ffff80; padding: 3rem;">
				<div>Mouse me over!</div>
				<div>Coords: <span>${stream}</span></div>
			</div>
		`;
	},

	'KeyboardSource (EventData)': () => {
		const stream = new Subject<char>();

		return rml`
			<input oninput="${EventData(stream)}" style="background-color: #ffff80; padding: 3rem;">
			<div>Last key pressed: <span>${stream}</span></div>
		`;
	},

	'KeyboardSource (Key)': () => {
		const stream = new Subject<char>();

		return rml`
			<input oninput="${Key(stream)}" style="background-color: #ffff80; padding: 3rem;">
			<div>Last key pressed: <span>${stream}</span></div>
		`;
	},

}

const sinks = {
	EmptyString: () => {
		return  rml``;
	},

	StaticNumber: () => {
		return  rml`<div>${123}</div>`;
	},

	StaticString: () => {
		return  rml`<div>${'hello'}</div>`;
	},

	AlertButton: () => {
		return  rml`<button onclick="${()=>alert('clicked')}">click me</button>`
	},

	StyleValueSink: () => {
		const bg = 'green';

		return  rml`
			Should be red
			<div style="background: ${bg}; color: white; padding: 1rem;">
				just some text
			</button>
		`;
	},

	AsyncStyleValueSink: () => {
		const bg = defer('red');

		return  rml`
			Should become red
			<div style="background: ${bg}; color: white; padding: 1rem;">
				just some text
			</button>
		`;
	},

	UndefinedSink: () => {
		const empty = undefined;

		return  rml`
			<button style="min-width: 5rem; min-height: 2rem;"r>${empty}</button>
		`;
	},

	UndefinedSource: () => {
		const empty = undefined;

		return  rml`
			Handler is undefined — nothing should happen.<br>
			<button onclick="${empty}">click me</button>
		`;
	},

	Mixin1: () => {
		const counter = new Subject().pipe(
			scan(x=>x+1, 0),
		);

		const mixin1: Mixin = (args?: any) => {
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
		`
	},

	Mixin2: () => {
		const mixin2: Mixin = (args?: any) => {
			const dataset = new Subject();
			const classObject = new Subject();
			const style = new Subject();
			const events = new Subject();

			setTimeout(() => {
				dataset.next({
					hello: 'world',
					foo: 'bar',
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
					onmouseover: () => console.log('mouseover'),
					onmouseout: () => console.log('mouseout'),
				});
			}, 3000)

			return {
				dataset,
				class: classObject,
				style,
				events,
			};
		};

		return rml`
			<div ...${mixin2()}>
				with mixin2()
			</div>
		`;
	},

	'Removed (Implicit)': () => {
		const removed = new Subject<Event>();

		return  rml`
			<div rml:removed="${removed}">
				Removed (Implicit) sink
				<button onclick="${removed}">Remove</button>
			</div>
		`
	},

	'Removed (Explicit on self)': () => {
		const removed = new Subject<Event>();

		return rml`
			<div rml:debugger rml:removed="${Removed(removed)}">
				Removed (Explicit) sink
				<button onclick="${removed}">Remove</button>
			</div>
		`;
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


	'Removed (Implicit Mixin, deferred)': () => {
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
		const removed = new Subject().pipe(
			map(() => ({
				'rml:removed': true,
				'class': 'removed',
			})),
		);

		return rml`
			<div ...${Removed(removed)}>
				Removed (Implicit Mixin) sink<br>
				(this should NOT be supported, in theory)<br>
				<button onclick="${removed}">Remove</button>
			</div>
		`;
	},


	'Attribute (Implicit)': (t = 3000) => {
		const stream = defer('bar');

		return rml`
			Attribute sink
			<style>
				.pqpqpq::after {
					content: attr(foo);
					margin: 0 1rem;
					color: darkgreen;
				}
			</style>
			<div class="pqpqpq" foo="${stream}">foo...</div>
		`;
	},

	'Attribute (Mixin)': (t = 3000) => {
		const stream = defer({foo: 'bar'});

		return rml`
			Attribute sink
			<style>
				.pqpqpq::after {
					content: attr(foo);
					margin: 0 1rem;
					color: green;
				}
			</style>
			<div class="pqpqpq" ...${stream}>...</div>
		`;
	},

	SyncDisabled: (t = 3000) => {
		const disabled = false;

		return rml`
			<button disabled="${disabled}">non-disabled</button>
		`;
	},

	AsyncDisabled: (t = 3000) => {
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
			<input readonly="${toggle}" value="toggle readonly, not only">
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
			<button onclick="${open$}">open</button>
		`;
	},

	AsyncDialogOpen: (t = 1000) => {
		const open$ = new Subject().pipe(
			map(_=>true)
		);
		const closeDialog = new Subject();

		return rml`
			Async dialog open sink
			close and destroy (can't reopen)
			<dialog open="${open$}" rml:removed="${closeDialog}">
				<p>dialog content</p>
				<button onclick="${closeDialog}">close</button>
			</dialog>
			<button onclick="${open$}">open</button>
		`;
	},

	'AppendHTML (Explicit)': () => {
		const incrementor = interval(1000).pipe(
			map(i=> `INTERVAL => ${i}<br>` as HTMLString)
		);

		return rml`
			Explicit AppendHTML sink
			<div>${AppendHTML(incrementor)}</div>
		`;
	},

	'InnerHTML (Implicit)': () => {
		const incrementor = interval(1000).pipe(
			map(i=> `INTERVAL => ${i}`)
		);

		return rml`
			Simple content sink
			<div>${
				incrementor
			}</div>
		`;
	},

	'InnerHTML (Explicit)': () => {
		const incrementor = interval(1000).pipe(
			map(i=> <HTMLString>`INTERVAL => ${i}`)
		);

		return rml`
			Explicit InnerHTML sink
			<div>${InnerHTML(incrementor)}</div>
		`;
	},

	ExplicitInnerHTML_Higher_Order_Observable: () => {
		const incrementor = interval(1000).pipe(
			map(i=> <HTMLString>`INTERVAL => ${i}`)
		);

		const HOO = interval(500).pipe(
			switchMap(_=> incrementor)
		);

		return rml`
			Explicit InnerHTML sink with higher-order observable
			<div>${InnerHTML(HOO)}</div>
		`;
	},

	ExplicitInnerText: () => {
		const incrementor = interval(1000).pipe(
			map(i=> <HTMLString>`<strong>INTERVAL</strong> => ${i}`)
		);

		return rml`
			Explicit InnerText sink
			<div>${InnerText(incrementor)}</div>
		`;
	},

	OnMount: () => {
		const onmount = () => alert('mounted');

		return rml`
			<div onmount="${onmount}">do on mount</div>
		`;
	},

	RMLOnMount: () => {
		const onmount = () => alert('mounted');

		return rml`
			<div rml:onmount="${onmount}">do on mount</div>
		`;
	},

	OnPlay: () => {
		const onmount = () => alert('play');

		return rml`
			<video controls onplay="${onmount}" style="max-width: 50%;">
				<source src="./flower.webm" type="video/webm" />
			</video>
		`;
	},

	TextContentExplicit: () => {
		const stream = interval(1000);

		return rml`
			<div>
				${TextContent(stream)}
			</div>
		`;
	},

	TextNodes: () => {
		const stream = interval(1000);
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
		const stream = interval(1000);
		const stream2 = new BehaviorSubject(0).pipe(
			scan(x=>x+1)
		);

		return rml`
			doesn't work if the button comes first?
			<button onclick="${stream2}">click</button>
			<div>
				Timer: ${stream}
				Count: ${stream2}
			</div>
		`;
	},

	Sanitize: () => {
		const Sanitize = input => ({
			type: 'sink',
			source: input.pipe(
				map(strHTML => strHTML.replace(/</g, '&lt;'))
			),
			sink: InnerHTMLSink
		});

		const stream = of('<script>alert("evil")</script>');

		return rml`
			<div>${Sanitize(stream)}</div>
		`;
	},

	CustomSink: () => {
		const Animate = input => ({
			type: 'sink',
			source: input,
			sink: node => data => {
				node.animate([
					{ transform: "rotate(0) scale(1)" },
					{ transform: "rotate(1turn) scale(0)" },
				],{
					duration: 2000,
					iterations: 1,
				})
			}
		});

		const stream = new Subject();

		return rml`
			<div>
				Blah
				<div ...${Animate(stream)}>Hohoho</div>
			</div>

			<div>${stream}</div>
			<button onclick="${stream}">animate</button>
		`;
	},

	Error: () => {
		const stream = new Subject().pipe(
			map(() => {
				throw new Error('synthetic error')
			}),
			//throwError('synthetic error')
		);

		return rml`
			Error stream
			<div>${stream}</div>
			<button onclick="${stream}">error</button>
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

	return rml`
		<style>
			* {
				font-size: 18px;
			}

			code {
				display: block;
				background-color: #e0e0e0;
				padding: 1rem;
				white-space: pre;
				tab-size: 2;
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

			li {
				margin-block: 1rem;
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
		</style>

		<button onclick="${()=>alert('clicked')}">click me</button><br>
		<button onclick="${logger}">click me</button>

		<hr>

		<fieldset>
			<legend>Sources</legend>
			<ul style="max-height: 50vh; overflow: auto; column-count: 2; list-style-type: none;">
			${
				Object.keys(sources).map((t, i, tests)=>rml`
					<li><button title="${Tooltip(tests[t])}" onclick="${pipeIn(chosen, map(()=>[sources, t]))}">${t}</button></li>
				`).join('')
			}
			</ul>
		</fieldset>

		<fieldset>
			<legend>Sinks</legend>
			<ul style="max-height: 50vh; overflow: auto; column-count: 2; list-style-type: none;">
			${
				Object.keys(sinks).map((t, i, tests)=>rml`
					<li><button title="${Tooltip(tests[t])}" onclick="${pipeIn(chosen, map(()=>[sinks, t]))}">${t}</button></li>
				`).join('')
			}
			</ul>
		</fieldset>


		<hr>
		Code:
		<code>${InnerText(chosenSource)}</code>

		<hr>
		Rendered:
		<section style="margin-block: 2rem;">
			${chosenComponent}
		</section>

	`;
}

document.body.innerHTML = component();

