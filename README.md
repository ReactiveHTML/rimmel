# Rimmel.js

A Functional-Reactive templating library for the Rx.Observable Universe.

In RML, Promises and Observables are fist-class citizens, so whenever they emit, their output is rendered.

No need for JSX, React, Babel or Webpack. 100% pure JavaScript/TypeScript that just works out of the box.

## Hello World!
The modern Hello World for reactive frameworks is a component with a button that counts how many times you click it.

To best illustrate reactivity in general we'll be using RxJS.

```javascript
// This click-counter view-model is just a simple
// in-out RxJS stream
const counter = new BehaviorSubject(0).pipe(
	// Emits 0, 1, 2, 3, ...
	scan(a => a+1)
)

// The template simply references the observable stream in an
// intuitive way,so it's clear what goes in and what comes out.
document.body.innerHTML = rml`
  <button type="button" onclick="${counter}">
    Click me
  </button>

  You clicked the button <span>${counter}</span> times.
`;
```

The `onclick` handler of the `<button>` element is _wired_ into `counter`, which is a Subject, an in-out RxJS transform stream.
Every time you click the button it emits a `MouseEvent` which is pumped into `counter`.
Since it's a transform stream, what it does is take the input, transform it and re-emit the result.
The result is then wired back to the DOM through a `Sink`.

## Why Rimmel?
- Functional-Reactive: you can treat nearly everything as observable streams, which means a lot less code to write
- Fast: No Virtual DOM, so renders are around _fast-enough_ for most use cases and updates can run at "vanilla+" speed in certain others
- Super simple to start: no toolchain required, just click and go [on Codepen](https://codepen.io/fourtyeighthours/)
- Powerful: Observables are not a requirement, but when using them you can manage even the most complex state you can think of with grace, elegance and simplicity

Playground: [Stackblitz](https://stackblitz.com/@dariomannu/collections/rimmel-js-experiments)

## Get Started
```
import { rml } from 'rimmel';
```


### Sources and Sinks
There are two key concepts used by Rimmel: sources and sinks.

Sources are things that generate data, which you can optionally process/transform along the way. What remains goes somewhere. That _somewhere_ is usually referred to as a sink.

Sources typically include any DOM events such as `onclick` or `onmousemove`, `fetch()` calls, just like promises in general, async functions and, most notably, Observables.

Sinks are most often the place where you want to display any information in the UI. Your main document, any state updates, notifications, console logs, etc.

With RML/Rimmel you can treat most DOM elements as sources, sinks, or both.

### Stream Processing
Sources normally emit raw data, not meant to display in a UI (e.g.: a ScrollEvent or a MouseEvent), so what we do is to process and format them.
This can include mapping, reducing, etc. RxJS comes with a comprehensive set of utility functions to transform data.

### Sources
Rimmel supports the following as observable sources:
- Event listeners from DOM elements. Essentially any attribute beginning with "on" can be bound to an observable.
- Anything else that can map to an Observable or a Promise. Websockets, Timers, `fetch()` calls, etc.
- Static values will be simply treated as non-reactive values and no data-binding will be created.

### Sinks
Rimmel supports two types of sinks: render-time and dynamic sinks.
Render-time sinks are the simplest and most intuitive ones: those you define in a template from which the data binding can be easily inferred. These include:
- Attributes for any HTML element
- Style attributes
- Datasets (data- attributes)
- innerHTML/innerText/textContent

Dynamic sinks enable apps to inject pretty much anything into them and the content will determine at runtime the correct bindings.

```javascript
const mixin = () => {
  const onmouseover = () => console.log('mouseover')

  const onclick = new Subject()

  // Emit 'clickable' first,
  // then 'clicked' afterwards
  const classes = onclick.pipe(
    mapTo('clicked-class'),
    startWith('clickable'),
  )

  // The following DOM Object will be "merged" into the element
  return {
    onclick,
    onmouseover,
    class: classes,
    'data-new-attribute': 'some value',
  }
}

const component = () => {
  return rml`
    <div ...${mixin()}></div>
  `
}
```
When the above component is rendered on the page, the mixin will inject everything else into it, including the `onclick` and `onmouseover` event handlers,
a statically defined `data-new-attribute` and a merge-in observable stream to set classes... dynamically!
Essentially, whenever the classes stream emits, it will be able to set/change/toggle class names in the component. More details in the upcoming RDOM (Reactive DOM) documentation.


### Building and testing
```bash
bun install
bun run build
bun test
```

### Supported Environments
Our focus is modern EcmaScript code. SSR is in the making.

## Current State
Rimmel is created and maintained by Hello Menu, is being used in production on an advanced and complex webapp and is now an independent spin-off project of its own.

It's not to be considered a "mature" web framework yet and it certainly has some minor bugs and gotchas, but it's ready for early adopters and FRP enthusiasts to create webapps with logic of any complexity.
It becomes especially powerful if paired with RxJS or possibly with other Observable libraries.

## Roadmap
- Observable completion handlers
- Observable error sinks
- Performance benchmarks
- Bug fixes
- SSR
- Support for Rx Schedulers for high-throughput highly-responsive real-time apps (trading front-ends, ad-tech, gaming, ...)
- Support text node and HTML comment sinks
- Tree-shakeable separation of sources and sinks
- Support for the EventEmitter type as source and sink
- Separate memory-optimised and speed-optimised sinks.
- Compiled Templates
- Plugin support
- RML Security

## Web Standards alignment
There are discussions going on around making HTML and/or the DOM natively support Observables at [WHATWG DOM/544](https://github.com/whatwg/dom/issues/544) and [WICG Observable](https://github.com/WICG/observable).

Rimmel.js intends to align with these efforts as they develop, mature and hopefully standardise.
