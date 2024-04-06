# Rimmel.js
_A Functional-Reactive UI library for the Rx.Observable Universe_

Rimmel treats Observables and Promises as fist-class citizens.<br />
An Observable emits => the DOM renders.<br />
The DOM emits => an Observers get data.<br />

No dependency on JSX, Virtual DOM, React, Babel, Webpack or others. No need to "set up" observables, no `fromEvent()` calls, no need to unsubscribe or dispose of observers or perform any memory cleanup.

Rimmel uses standard JavaScript and it works out of the box.

## Hello World
The modern "Hello World" for reactive stuff is a button with a click counter.
Schematically it looks as follows:
![Rimmel Sources and Sinks](docs/assets/click-counter-diagram.png)
The corresponding code:

```javascript
// This click-counter is just
//  a simple in-out RxJS stream
const counter = new BehaviorSubject(0).pipe(
  scan(a => a+1) // Emits 0, 1, 2, 3, ...
);

// Following comes the template.
// It simply references the observable above
// in an intuitive way, so it's clear what
// goes in (data) and what comes out (events).

document.body.innerHTML = rml`
    <button type="button" onclick="${counter}">
        Click me
    </button>

    Clicked <span>${counter}</span> times.
`;
```

The `onclick` above is wired into `counter`, an RxJS Subject that takes `Event` objects in and spits numbers out.

The result is automatically wired back to the `<span>` by means of a `Sink`.

## Actually scalable
Combining observable streams to handle your state will give you unlimited control over async events and their coordination, thanks to the full range of RxJS operators you can use.

Rimmel just binds your observable streams to the UI with a seamless integration that will result in improved code quality, scale, testability and performance.

## Imperative-Reactive? No
Most other reactive or non-reactive JavaScript templating solutions out there are designed for the imperative programming paradigm. Occasionally they may support a few aspects of functional programming. Third-party adapters can also help with it, but the truth is that FRP was just an afterhthought, severely limiting its use in practice.

Rimmel is different in that it does mainly focus on the functional-reactive paradigm (FRP, for short).
Although some imperative-reactive patterns work, supporting them is not the primary goal of this work.

## Functional-Reactive? Yes
What makes Rimmel functional-reactive is that you can treat everything as observable streams, like event handlers and data sinks.

This means you never really write code that changes the status of something, as in:<br />
```
target.property = value;
```

What you do instead, is you declare which stream do changes come from and you declare that in your templates:

```
<target property="${valueStream}">
```

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
Rimmel supports two types of sinks: specialised and dynamic sinks.
Specialised sinks are the simplest and most intuitive ones: those you define in a template from which the data binding can be easily inferred.<br />
These include:
- Attribute
- Class
- Dataset
- Value
- Style
- innerHTML/innerText/textContent
- Higher-order Sinks (sinks that emit other sinks)
- Custom Sinks

Dynamic sinks can emit any of the above and will be evaluated at runtime.

Dynamic sinks are best suited for cases when flexibility is preferred over raw performance.

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
a statically defined `data-new-attribute` and a merge-in observable stream to set classes dynamically!
Essentially, whenever the classes stream emits, it will be able to set/change/toggle class names in the component. More details in the upcoming RDOM (Reactive DOM) specification.

## Use with LLMs
We created an experimental [RimmelGPT.js](https://chat.openai.com/g/g-L01pb60It-rimmelgpt-js), a custom ChatGPT-based coding assistant you can use to convert existing components, to create new ones, to help get started. (Please note it's still experimental, and some hallucinations can happen when building complex components.)

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

Rimmel follows and aims to align with these efforts as they develop.
