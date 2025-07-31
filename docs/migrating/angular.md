# Rimmel for Angular Developers

If you're coming from Angular, this page will help you understand key concepts, similarities and differences to help you grasp the right mindset

## Templates, Tagged Templates
Angular supports both static strings or tagged templates.
However, all expreessions are part of the templates themselves and evaluated internally by Angular's template parser.

With Rimmel you use its `rml` template tag and all expressions must use the standard `${}` if you want to insert some.

Template expressions follow the standard JavaScript semantics and scope, so if you want to reference a variable, a promise, a stream, those need to be in lexical scope.

```js
const randomNum = Math.random();

document.body.innerHTML = rml`
  <div>This is a random number: ${randomNum}</div>
`;
```

## Class methods, properties => Sink Expressions
In Angular you define helper methods, functions or state as members of the given component class.

In Rimmel you don't need classes. Literally anything that's in scope can be used in a template.

```js
// A plain value
const randomNum = Math.random();

// A Promise
const randomPromise = fetch('/api/random').then(r=>r.json());

// An Observable Stream
const randomStream = fromEvent(document, 'click').pipe(
  map(e=>e.clientX)
);

target.innerHTML = rml`
  <div>A number: ${randomNum}</div>
  <div>A promise: ${randomPromise}</div>
  <div>A stream: ${randomStream}</div>
`;
```


## Event Handlers => Implicit binding
In Angular event handlers are defined according to its custom DSL: `(click)=handler()`.

In Rimmel your event handlers can be strings (like in plain Vanilla), references to functions or Observable Streams.

```ts
// A handler function
const handlerFn = (e: Event) => {
  doSomethingWith(e);
}

// An Observable Stream
const handlerStream = new Subject<Event>().pipe(
  map(e => somethingWith(e))
);

const RimmelComponent = () => rml`
  <!-- a handler string -->
  <button onclick="alert('clicked')">click</button>

  <!-- a handler function -->
  <button onclick="${handlerFn}">click</button>

  <!-- a handler stream -->
  <button onclick="${handlerStream}">click</button>
`;
```

## Async Pipes => Implicit binding
In Angular you have the Async Pipe which gives you a way to sink the content of a stream.

In Rimmel you don't need to specify it. By default, any Promise or Observable can be sinked directly anywhere in the DOM, including content, classes, CSS styles, attributes, event handlers.

```js
// An Observable Stream
const red = Promise.resolve('red');

const RimmelComponent = () => rml`
  <div style="color: ${red};" class="big ${red}">
    ${red}
  </div>
`;
```

Rimmel doesn't stop here. You can go to extremes by sinking whole objects by means of Attribute Mixins:

```js
const Draggable = () => {
  const drag = ... the logic
  return {
    onmousedown: drag,
    class: 'draggable',
  }
};

const RimmelComponent = () => rml`
  <div ...${Draggable()}>
    this is draggable
  </div>
`;
```

You can find a running example [here](https://stackblitz.com/edit/rimmel-draggable).


## Signals, NgRx => RxJS
If you want to use RxJS for state in Angular, you either have to use external libraries such as NgRx or convert your streams to Signals.

In Rimmel you don't need any of that as Observables, Subjects, BehaviorSubjects are supported out of the box and you don't need Signals either.

Observables, contrarily to some narrative, are perfectly capable of handling state thanks to the extensive support offered by Rimmel's templating system.

## Change Detection => Fine-Grained Updates
Change Detection is Angular's strategy to make non-reactive variables work as if they were reactive.

In Rimmel, state and transition are always implicitly embedded in streams, whether promises or observables, so whenever they emit a value, that's just "sinked" into the DOM directly.
This is often referred-to as fine-grained updates which make any change detection strategy totally unnecessary.

## Build Tools
Angular diverged significantly from HTML and JavaScript standard semantics so it's heavily dependent on transpilation and build tools.

Rimmel's syntax is 100% pure standard JavaScript, so it doesn't require any build tools, but you are absolutely free to use any build tools of your choice.

## Lifecycle Events => nothing
Angular provides a number of lifecycle events such as `ngOnInit` to help initialise/cleanup components.
This is central in imperative programming but comes with an extended bug surface in case you forget to perform some key setup or cleanup actions.

Rimmel provides declarative patterns to perform all operations you would normally perform inside lifecycle event handlers, such as setting up events, sinks, initial values, etc.

## Subscriptions/Unsubscriptions => Implicit stream binding
In Angular you're responsible for most subscriptions and unsubscriptions of the reactive streams you use.

In Rimmel all subscriptions/unsubscriptions are managed by the library. In fact you never have to make calls to `subscribe`/`unsubscribe` in your components.

## Dependency Injection => Extensible Effects or Messagebus
Angular makes extensive use of its own DI system to help separating components and dependencies.

There are other patterns that can achieve the same result:
- A messagebus like the one that from [the-observable-plugin-system](https://github.com/ReactiveHTML/the-observable-plugin-system), which lets you connect your modules purely via messages, making it very easy to replace them in unit tests.
- Extensible Effects is a pattern in Functional Programming in which effects are only declared by a component, but executed separately.

## Services => Extensible Effect Handlers
Angular services are singletons, available everywhere, that perform various side effects or manage global state.

For simple, non-enterprise applications you can create singleton services and import them directly, but this becomes an anti-pattern the more your application grows.

