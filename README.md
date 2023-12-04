# Rimmel.js

Reactive HTML for next-generation webapps, from the most simple, to really advanced stuff.
No need for JSX, no need for React, no need for Babel. This is all pure standard JavaScript and a pinch of salt.

```javascript
const data = fetch('https://example.com')
	.then(data=>data.text())

document.getElementById('target').innerHTML = rml`
	<div>${data}</div>
`
```

### Explanation
A promise is created that will eventually resolve.
Some HTML is rendered meantime.
The promise is bound as a sink into the element. When it resolves, the element gets updated.
That's is.


## Going reactive with RxJS

This is a simple observable stream that counts anything that passes through it
```javascript
const counter = (new BehaviorSubject(0)).pipe(
	scan(a=>a+1)
)

document.body.innerHTML = rml`
	<button type="button" onclick="${counter}"> Click me </button>
	You clicked the button <span>${counter}</span> times.
`;
```

The `<button>` element's `onclick` handler gets _wired_ into `counter`, which is a hybrid between an Observable and an Observer.
Every time you click the button it emits a click event which is pushed into the `counter`.

`counter` is a very simple state machine. You can compare it to a reducer, if you come from the Redux world.

It gets some events as input, outputs the count and is wired into the `<span>` element setting `.innerHTML` on it.

## Why Rimmel?
Rimmel is particularly light (~2.5K) fast (no DOM diff), and flexible (see the [examples](https://github.com/hellomenu/rimmel/tree/master/examples)).


## Get Started
We'll just skip the "hello world" example, as it's not so exciting, but you can many examples in the code.

### Sources and Sinks
There are two key concepts we use here, which come straight from functional programming: sources and sinks.

Sources are things that generate data. You can optionally process them and what remains goes in your sinks or UI elements.

Sources typically include DOM elements that emit events, `fetch()` calls or promises in general, async functions and Observables.

Sinks are most often the places where you want to display any information in your UI. Your main document, any state updates, notifications etc.

With Rimmel you can think of most DOM elements as observable streams or sinks.

### Stream Processing
Sources normally emit raw data, not meant to display in a UI (e.g.: a ScrollEvent), so what we do is to process and format them. This can include mapping, reducing, etc. RxJS comes with some of the most incredible functions to transform data.

### Supported Sources
Rimmel supports the following as observable sources:
	- Event listeners from DOM elements. Essentially any attribute beginning with "on" can be bound to an observable.
	- Anything else that can map to an Observable or a Promise. Websockets, Timers, `fetch()` calls, etc.

### Supported Sinks
Rimmel supports the following as sinks:
	- Attributes for any HTML element.
	- Style attributes
	- Datasets
	- innerHTML/innerText/textContent

### Supported Browsers
Our focus is modern browsers only that support ES6+ and there is no plan to ever support IE4, etc.

### Node.js / Deno
We are currently working on server-side-rendering, with support for streaming and a new concept of transferable promises and observables (stay tuned to know more)

## Current State
Rimmel is created and maintained by Hello Menu, is being used in production on our advanced and complex web platform and is now an independent spin-off project of its own.

It's not a mature web framework yet and it may have some minor bugs and gotchas, but it's definitely ready for early adopters and FRP enthusiasts to create webapps with complex logic.
It becomes especially powerful if paired with RxJS or possibly with other FRP libraries.

## Run the Examples
```
	npm install
	npm run examples
```
Then point your browser to one of the URLs specified and navigate to the examples folder.

## Roadmap
	- Bug fixes
	- Interesting use cases, like Observable completion/error behaviours, etc.
	- Fair performance benchmarks for real-life scenarios (so not like 100 million DOM elements on a page, etc).
	- SSR
	- Use Rx Schedulers for high-throughput highly-responsive real-time apps (trading front-ends, etc)
	- Safe, fully automatic unsubscription of some observables (There may be some small memory leaks atm if you render and destroy very large amounts of views)
	- ObservableArray support for lists, grids and more complex and/or asynchronous data structures.

## Standardisation
There are people trying to make HTML natively support Observables and some discussion is going on here:

[whatwg/544](https://github.com/whatwg/dom/issues/544)

## We're looking for contributors
If you like what you've seen please join the party and help us stir the JavaScript world up a bit. There is a clear need for yet another JavaScript framework, that's why we are here ;)

