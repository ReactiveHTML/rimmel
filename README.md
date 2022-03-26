# RxHTML
Supercharged reactive template engine/framework for next-generation webapps.

Let's pretend, for a moment, that the DOM has a reactive interface, directly supporting Observables, Promises, and/or other patterns, in addition to just `addEventListener`, `.innerHTML`, `.value`, etc.


What would the world look like?

```
// a simple observable stream that
// counts anything that passes through it
const data = fetch('https://example.com')
	.then(data=>data.text)

document.body.innerHTML = render`
	<div>${data}"</div>
```

## What just happened?
That's data binding on steroids. The `<button>` element's `onclick` handler is wired into `counter`, which is a hybrid between an Observable and an Observer. Every time you click the button, it emits a click event which is pushed into the `counter`.

`counter` is a very simple state machine. You can compare it to a reducer, if you come from the Redux world.

It gets some events as input, outputs the count and is wired into the `<span>` element setting `.innerHTML` on it.

## Why RxHTML?
The code powering most of this magic is about 120 lines of code. It's extraordinarily light, fast and minimalistic.

Also, you don't need to use React, Redux, DOM diffs, Hooks, JSX, Babel, React-dev-tools, redux-tools and whatever.
All the above runs in plain JavaScript/ES6. No transpilation step is required.
Combine it with a router of your choice (this is simple and amazing: (router-in-100-lines)[https://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url] and you'll have your ready-to-go simple webapp.

Any change you make to your state, when you use Observables or Promises, it gets wired directly to a DOM manipulation command at mount time, so it couldn't literally be any faster than that.

## Why not just use React, or Svelte?
We don't like the concept of a virtual DOM and DOM diff, as it's overcomplicated.

Whenever you talk React, since the DOM diff is not an exact science, you talk about its performance issues and unnecessary re-renders taking place.

Svelte? 
Svelte does the right thing (does no DOM diff), so has a beautiful performance but it also needs a compiler and lacks the transformative power of observables.

RxHTML needs no transpiler, no DOM diffing, is designed to integrate with the most powerful functional-reactive library around and serves as the last-mile to it, by making HTML itself (appear) functional-reactive.

RxHTML weighs about 2.5KB when shipped over the wire.

### RxJS is difficult
Using RxJS is not necessary here, just extremely convenient.
Yes, it is difficult, but so are modern UIs. Heavy adverts on a page loading async whilst something is waiting for both user input and AJAX calls racing. Meantime the 4G becomes weak and a couple of connections get reset. We don't want the page to get stuck, so meantime we want to display a spinner, and as soon as network is back again, finish our downloads, then display a nice notification. And all this needs to be easily testable.

Scenarios like this belong to the real world in the XXI century. What's difficult is implementing these sort of things *without* high-level FRP libraries like RxJS.
Do invest a few months to learn it and creating webapps will become a much more fulfilling experience.


## Get Started
We'll just skip the "hello world" example, as it's not so exciting, but you can many examples in the code.

### Sources and Sinks
There are two key concepts we use here, which come straight from functional programming: sources and sinks.

Sources are things that generate events. You can optionally process them and what remains goes in your sinks.

Sources typically include DOM elements, `fetch()` or promises in general, async functions, but most importantly, Observables.

Sinks are most often the places where you want to display any information in your UI. Your main document, state, notifications, whatever.

With RxHTML you can think of most DOM elements as observable streams or sinks.

### Stream Processing
Sources normally emit raw data, not meant to display in a UI (e.g.: a ScrollEvent), so what we do is to process and format them. This can include mapping, reducing, etc. RxJS comes with some of the most incredible functions to transform data.

### Supported Sources
RxHTML supports the following as observable sources:
	- Event listeners from DOM elements. Essentially any attribute beginning with "on" can be bound to an observable.
	- Anything else that can map to an Observable or a Promise. Websockets, Timers, `fetch()` calls, etc.

### Supported Sinks
RxHTML supports the following as sinks:
	- Attributes for any HTML element.
	- style attribute
	- datasets
	- innerHTML/innerText/textContent

### Supported Browsers
Our focus is modern browsers only that support ES6+ and there is no plan to ever support IE4, etc.

### Node.js / Deno
We have server-side-rendering on our roadmap which should require only a few little modifications to the code and a little bit of functionality for rehydration, but we're not there just yet. PRs are welcome.
	
## Current State
RxHTML is created and maintained by Hello Menu, is being used in production on our advanced and complex web platform and is now an independent spin-off project we wanted to share with the world.

It's not a general-purpose and mature web framework yet and it has a few bugs and gotchas, but it's definitely ready for early adopters and FRP enthusiasts to create webapps with complex logic.
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

[https://github.com/whatwg/dom/issues/544]

## We're looking for contributors
If you like what you've seen please join the party and help us stir the JavaScript world up a bit. There is a clear need for yet another JavaScript framework, that's why we are here ;)

