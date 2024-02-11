---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

# layout: home
#   layout: home
# title: Rimmel.js
# permalink: /
---

It's 2024

Rimmel lets you create async templates using promises and in-out observable streams with convenience.

No need to create and manage subscriptions. No need to unsubscribe. No need for JSX, React, Babel or transpilers. Works out-of-the-box in any HTML/JavaScript setup.

# Hello World
This is a library for async functional-reactive interactivity, so we'd rather start in the deep water, rather than printing _Hello World_.

The following is a simple component that makes use of an RxJS Observable stream for state management, counts the clicks you made on a button.
The stream is connected to a `<button>` in input and a `<span>` element in output.


```js
const counter = new BehaviorSubject(0).pipe(
    scan(a => a+1) // Emits 0, 1, 2, 3, ...
);

document.body.innerHTML = rml`
    <button type="button" onclick="${counter}"> Click me </button>
    You clicked the button <span>${counter}</span> times.
`;
```

Try it on [Codepen](https://codepen.io/fourtyeighthours/pen/bGKRKqq?editors=0111){:target="_blank"}

And this is a more visual view of the above
![Rimmel Sources and Sinks](./assets/click-counter-diagram.png)

"onclick" is treated as an event source, wired to a state machine that takes hits in input and emits counts in output, in the form of an Observable stream, and all is wired as an HTML Sink in a `span` element.



# Sources and Sinks
There are two exciting aspects of Rimmel templates: sources and sinks.

**Data Sources** are things that generate data. They take input events, typically from the DOM, but also websockets or other browser or non-browser events. They are turned into streams for you to transform and consume.
Data sources can be:
- Any DOM events such as `onclick` or `onmousemove`
- Promises
- Calls to the `fetch()` API
- Observable Streams

Data sources are automatically exposed as Observables, if Rimmel detects you're using any. They are not a mandatory requirement, though.

**Data Sinks** are connections to the DOM, the console, web sockets or wherever you want to output your data.

There are several specialised sinks in Rimmel that allow you to only change what you want, when you want it, so no unwanted or unexpected render ever happens.
- HTML Sink
- Class Sink
- Style Sink
- Dataset Sink
- Attribute Sink

Rimmel guesses which data sinks you want to use. In the following example it's obvious you want to set class and content:

```js
const stream1 = getSomeClassesStream();
const stream2 = getSomeContentStream();

const template = rml`
	<div class="${stream1}">${stream2}</div>
`;

target.innerHTML = template;
```


# Other Scenarios
Various observable streams can be organised in one or more view-models and be mixed and matched together, feeding each-other,
a bit like wires in elecric circuits.
![Rimmel Sources and Sinks](./assets/how-rimmel-works-3.png){:class="img-responsive"}


## Using Promises
Standard promises can only emit data, can't be fed from the outside, so they can only be treated as data sources.
```javascript
const remoteDataComponent = () => {
    const data = fetch('https://example.com').then(data => data.text());

    return rml`
        <div>${data}</div>
    `;
};

document.body.innerHTML = remoteDataComponent();

```
Try on [Promises, Codepen](https://codepen.io/fourtyeighthours/pen/mdzMYPd??editors=0111)


## Async Mixins
We played with basic promises and observables. However, Rimmel allows you to emit structured data from your promises or observables to eventually activate additional behavior in your compoments (think activating logged-in status without refreshing the page, activating an "edit" mode, etc). All in proper functional-reactive, highly testable style. (examples to follow)


## Stuck with jQuery?
There's no clash between Rimmel and jQuery. You can start adding RML templates in your jQuery apps now. [Codepen](https://codepen.io/fourtyeighthours/pen/mdzMYPd)

## Testing
We created [Leaping Bunny](https://github.com/hellomenu/leaping-bunny) an rx-marbles based library to make testing Rimmel components straight forward, especially when async and complex interactions are involved.
A working playground is available [LeapingBunny on StackBlitz](https://stackblitz.com/edit/rimmel-testing-with-vitest-and-leaping-bunny?file=README.md)

## Example code
See and interact with various examples:
  [Examples, Codepen](https://codepen.io/fourtyeighthours/collections/)


# Motivation?
Rimmel is for you if you've tried other functional-reactive JavaScript frameworks but you weren't totally satisfied,
or if you find other pseudo-observable implementations like signals and hooks very limiting, plus you wouldn't mind
any of the following:

- Light weight: 100LoC, ~2.5K @v1. We're planning to reduce its size even more, below 1K
- No virtual DOM, no DOM diff
- No unwanted/unexpected re-rendering storms. A component does never actually re-render the way it happens in other frameworks.
    Data sources emit data, you transform it, filter it and only sink it when you decide and allow.
- Fast: There are no official benchmarks yet, but first-time renders (new HTML sent to the page) is fast, feels "fast-enough".
    Subsequent DOM updates can run at "vanilla+" speed in certain cases.
- Powerful: state can get as powerful and advanced as your creativity and RxJS skills when paired with Observales
- Functional-Reactive: support for most DOM sources and sinks
- Great unit-testability, especially in complex and/or async interaction scenarios


# Supported Browsers
Our focus is modern browsers only that support ES6+. There is no plan to support any IE4, etc.

# Performance
Rimmel doesn't use a Virtual DOM. What it does, instead, is mounting some high-throughput DOM sinks, which can give you vanilla+ performance in _certain_ use cases.
That means a little bit faster than `document.getElementById('target').style.color = 'blue';`

# Further documentation
A number of articles are being published on state management, state as a stream, structured state, examples, challenges, components, etc. Just search for "rimmel.js", search engines are your friends. We're building a custom GPT, as well, but its coding skills are not there yet.

# Current State
Rimmel is created and maintained by Hello Menu, is being used in production on our advanced and complex web platform.
We had some insane fun developing it, we created complex and advanced async front-end architectures that became ridiculously simple and short to implement, easily testable, performing greatly, so now we're sharing it with the world as an independent spin-off project.

It's not to be considered a "mature" library yet and it certainly has a few minor bugs and gotchas that can all be worked around but it's ready for early adopters and FRP enthusiasts to create webapps of any size and complexity.

Although not necessary, it becomes especially powerful if paired with RxJS or possibly with other Observable libraries (we haven't tried those).


# Roadmap
- TypeScript support (in progress)
- Full ObservableArray support for lists, grids and complex repeatable data structures
- Completion handlers
- Error sinks
- Fair performance benchmarks for real-life scenarios (so not like 100 million DOM elements on a page, etc)
- SSR with Transferable Promises and Transferable Observables
- Scheduler support for high-throughput highly-interactive real-time apps
- Support text node and HTML comment sinks
- Tree-shakeable separation of sources and sinks
- EventEmitter support
- Compiled Templates
- Rendering pipelines/Plugin support
- Micro frontend support
- JSX/ESX support?
- RML Security

# Web Standards
There are people trying to make the DOM natively support Observables and some discussion is going on at [WHATWG DOM/544](https://github.com/whatwg/dom/issues/544)
