# Rimmel.js

Functional-Reactive HTML/RML Template Engine for next-generation webapps that scales gracefully and thrives in complexity.

In RML, Promises and Observable streams are fist-class citizens. Rimmel subscribes to them behind the scenes both ways, in and out, making a seamless, elegant and testable integration.
No need for JSX, React, Babel. It's 100% pure JavaScript.

```javascript
const remoteDataComponent = () => {

	const data = fetch('https://example.com')
		.then(data => data.text())

	return rml`
		<div>${data}</div>
	`
}

document.body.innerHTML = remoteDataComponent()

```

## Going functional-reactive with Observables

Following we have a view-model, a state machine, a simple observable stream that counts any events passing through
```javascript
// Emits 0, 1, 2, 3, ...
const counter = new BehaviorSubject(0).pipe(
	scan(a => a+1)
)

document.body.innerHTML = rml`
	<button type="button" onclick="${counter}"> Click me </button>
	You clicked the button <span>${counter}</span> times.
`;
```

The `<button>` element's `onclick` handler gets _wired_ into `counter`, which is a Subject, an in-out RxJS transform stream.
Every time you click the button it emits a click event which is pumped into `counter`.
Since it's a transform stream, what it does is take the input, transform it and re-emit the result.
Rimmel then wires it back to the DOM as a sink.

## Why Rimmel?
Top reasons to choose it:
	- Light weight: ~2.5K in version 1. <1K size planned in subsequent versions
	- Fast: "fast-enough" first-time renders, then vanilla-speed DOM updates
	- Powerful: manage the most complex state with incredible ease when using Observales
	- Functional-Reactive: support for most DOM sources and sinks


Example code: see the [examples](https://github.com/hellomenu/rimmel/tree/master/examples)


## Get Started
We'll just skip the "hello world" example, as it's not so exciting, but you can see several examples in the code or online.

### Sources and Sinks
There are two key concepts we use here, which come straight from functional programming: sources and sinks.

Sources are things that generate data. You can optionally process them and what remains goes in your sinks or UI elements.

Sources typically include any DOM events such as `onclick` or `onmousemove`, `fetch()` calls, just like promises in general, async functions and Observables.

Sinks are most often the places where you want to display any information in your UI. Your main document, any state updates, notifications, console logs, etc.

With RML/Rimmel you can treat most DOM elements as sources, sinks, or both.

### Stream Processing
Sources normally emit raw data, not meant to display in a UI (e.g.: a ScrollEvent), so what we do is to process and format them.
This can include mapping, reducing, etc. RxJS comes with a comprehensive set of utility functions to transform data.

### Supported Sources
Rimmel supports the following as observable sources:
	- Event listeners from DOM elements. Essentially any attribute beginning with "on" can be bound to an observable.
	- Anything else that can map to an Observable or a Promise. Websockets, Timers, `fetch()` calls, etc.
	- Static values will be simply treated as non-reactive values and no data-binding will be created.

### Supported Sinks
Rimmel supports two types of sinks: render-time and dynamic sinks.
Render-time sinks are the simplest and most intuitive ones: those you define in a template from which the data binding can be easily inferred. These include:
	- Attributes for any HTML element.
	- Style attributes
	- Datasets (data- attributes)
	- innerHTML/innerText/textContent

Dynamic sinks enable apps to inject pretty much anything into them and the content will determine at runtime the correct bindings.

```javascript
const mixin = () => {
	const onmouseover = () => console.log('mouseover')

	const onclick = new Subject()

	// emit 'clickable' first,
	// then 'clicked' afterwards
	const classes = onclick.pipe(
		mapTo('clicked-class'),
		startWith('clickable'),
	)

	return {
		onclick,
		onmouseover,
		'data-new-attribute': 'some value',
		class: classes,
	}
}

const component = () => {
	return rml`
		<div ...${mixin()}></div>
	`
}
```

When the above component is rendered on the page, the mixin will inject everything else into it, including the `onclick` and `onmouseover` event handlers,
a statically defined `data-new-attribute` and a merge-in observable stream to set classes... dynamically. Essentially, whenever the classes stream emits, it will
be able to dynamically set/change/toggle class names in the component. More details in the upcoming RDOM (Reactive DOM) documentation.


### Supported Browsers
Our focus is modern browsers only that support ES6+ and there is no plan to ever support IE4, etc.

## Current State
Rimmel is created and maintained by Hello Menu, is being used in production on our advanced and complex web platform and is now an independent spin-off project of its own.

It's not to be considered a "mature" web framework yet and it certainly has some minor bugs and gotchas, but it's ready for early adopters and FRP enthusiasts to create webapps with logic of any complexity.
It becomes especially powerful if paired with RxJS or possibly with other Observable libraries.

## Run the Examples
```bash
npm install
npm run examples
```
Then point your browser to one of the URLs specified and navigate to the examples folder.

## Roadmap
- Full ObservableArray support for lists, grids and complex repeatable data structures
- Observable completion handlers
- Observable error sinks
- Fair performance benchmarks for real-life scenarios (so not like 100 million DOM elements on a page, etc)
- Bug fixes
- SSR
- Support for Rx Schedulers for high-throughput highly-responsive real-time apps (trading front-ends, ad-tech, etc)
- Support text node and HTML comment sinks
- Tree-shakeable separation of sources and sinks
- Support for the EventEmitter type as source and sink
- TypeScript support
- Compiled Templates
- Plugin support
- RML Security

## Web Standards
There are people trying to make HTML natively support Observables and some discussion is going on at [WHATWG DOM/544](https://github.com/whatwg/dom/issues/544)

