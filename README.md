# Rimmel.js
_A Functional-Reactive UI library for the Rx.Observable Universe_.

Rimmel treats Observables and Promises as fist-class citizens: sink them in a template and they will render. When a DOM event is fired, Observers get data.

No dependency on JSX, React, Babel, Webpack or others. No need to "set up" observables, no need to make `fromEvent()` calls, no need to manually unsubscribe or dispose of observers or perform any memory cleanup.

Rimmel uses 100% standard JavaScript and it works out of the box.

## Hello World  (AKA the reactive click counter)
The modern "Hello World" for reactive stuff is a button counting user clicks.

```javascript
// This click-counter is just
//  a simple in-out RxJS stream
const counter = new BehaviorSubject(0).pipe(
	// Emits 0, 1, 2, 3, ...
	scan(a => a+1)
);

// Following comes the template.
// It simply references the observable above
// in an intuitive way, so it's clear what
// goes in (data) and what comes out (events).

document.body.innerHTML = rml`
  <button type="button" onclick="${counter}">
    Click me
  </button>

  You clicked <span>${counter}</span> times.
`;
```

The `onclick` above is wired into `counter`, an RxJS Subject that takes `Event` objects in and spits numbers out.

The result is automatically wired back to the <span> by means of a `Sink`.

## Scale up, not down
You might wonder whether the above (observables, subjects, scan) is not overkill for a click counter.

The answer is no, but it doesn't matter anyway. You won't be using it for just click-counters, but more complex, advanced, and real-life web applications and components.

That's exactly where you'll get the benefits: combining observable streams to handle your state, guarantees unparalleled control over async events and their coordination, thanks to RxJS and operators.

Rimmel just binds your observable streams to your UI with a seamless integration that will result in unparalleled code quality, scale and testability and performance.


## Not Imperative-Reactive
Most other reactive or non-reactive JavaScript templating solutions out there are designed for the imperative programming paradigm. Occasionally they may support some aspects of functional programming, sometimes third-party adapters help with that, but that means FRP was just an afterhthought, severely limiting its use in practice.

Rimmel is different in that it does mainly focus on the functional-reactive paradigm (FRP, for short).
Although some imperative-reactive patterns work, supporting them is not the primary goal of this work.

## ... but Functional-Reactive
What makes Rimmel functional-reactive is that you can treat nearly everything as observable streams, like event handlers and data sinks of many types.

This means you don't normally change the status of something `target.property = value`. Instead, you declare which stream do changes come from. In this case, since it's a templating library, you do that in your templates `<target>${source}</target>`!


## Get Started
```
import { rml } from 'rimmel';
```


## Sources vs. Sinks
There are two key concepts used by Rimmel: sources and sinks.

Sources are things that generate data, which you can optionally process/transform along the way. What remains goes somewhere. That _somewhere_ is usually referred to as a sink.

Sources typically include any DOM events such as `onclick` or `onmousemove`, `fetch()` calls, just like promises in general, async functions and, most notably, Observables.

Sinks are most often the place where you want to display any information in the UI. Your main document, any state updates, notifications, console logs, etc.

With RML/Rimmel you can treat most DOM elements as sources, sinks, or both.

## Stream Processing
Sources normally emit raw data, not meant to display in a UI (e.g.: a `ScrollEvent` or a `MouseEvent`), so what we do is to process and format them.
RxJS comes with a comprehensive set of utility functions to transform data streams.

## Sources
Rimmel supports event listeners from all DOM elements.
Static values are treated as non-observable values and no data-binding will be created.

## Sinks
Rimmel supports two types of sinks: render-time and dynamic sinks.
Render-time sinks are the simplest and most intuitive ones: those you define in a template from which the data binding can be easily inferred. These include:
- Attribute
- Class
- Dataset
- Value
- Style
- innerHTML/innerText/textContent
- Higher-order Sinks (sinks that emit other sinks)
- Custom Sinks
- Dynamic Sinks

## Mixins
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
  // <! -------------------------------------------------------
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


## Building and testing
```bash
bun install
bun run build
bun test
```


## Roadmap
- Observable completion handlers
- Observable error sinks
- Performance benchmarks
- SSR
- Scheduler support for real-time apps (trading front-ends, ad-tech, gaming, ...)
- Support text node and HTML comment sinks
- Support for the EventEmitter type as source and sink
- Separate memory-optimised and speed-optimised sinks.
- Compiled Templates
- Plugin support
- Sink pipelines
- RML Security

## Web Standards alignment
There are discussions going on around making HTML and/or the DOM natively support Observables at [WHATWG DOM/544](https://github.com/whatwg/dom/issues/544) and [WICG Observable](https://github.com/WICG/observable).

Rimmel.js follows and aims to align with these efforts as they develop.
