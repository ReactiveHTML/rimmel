# Rimmel for React Developers

If you're coming from React, this page will help you understand key concepts, similarities and differences to help you grasp the right mindset

## JSX => Tagged Templates
React is typically used with JSX, although it's not mandatory. It's perfectly possible to use `createElement` calls and build a tree from there.

Rimmel's `rml` template tag knows nothing about your tree structure and doesn't care, so it treats all your HTML as strings, making it behave more like
Vanilla JS from this point of view:

```js
document.body.innerHTML = rml`
  <div>This is a simple template that behaves just like a string</div>
`;
```

## Mounting, Unmounting
In React you use the `mount()` function.

With Rimmel you assign a template to the `innerHTML` property of the target container.

```js
target.innerHTML = rml`the content`;
```

A template can only be used once, so the following will not work:

```js
// don't do this
const template = rml`some content`;
target1.innerHTML = template;
target2.innerHTML = template;
```

What you do instead is use a function that returns a template:

```js
// do this instead
const template = () => rml`some content`;
target1.innerHTML = template();
target2.innerHTML = template();
```


## Fragment elements => Nothing
In React you always need to create a tree. If your template is not a tree, you have to use Fragment Elements: `<></>`.

Since Rimmel with `rml` treats your template as strings, there is just no such restriction and you can render a template made of multiple elements.

```js
document.getElementById('target').innerHTML = rml`
  <span>This</span>
  is
  <u>a simple template</u>
  <i>that</i>
  behaves just like
  <strong>a string</strong>
`;
```

## JSX Expressions => Template Expressions
Whenever you want to reference any dynamic content as JSX expressions you use braces `{}` to surround them.

Tagged templates used by Rimmel follow the JavaScript standard, which is the `${}` syntax.

```js
const randomNum = Math.random();

target.innerHTML = rml`
  <div>This is a random number: ${randomNum}</div>
`;
```

## JSX "sink" expressions => Sink Expressions
A "sink" expression is one that represents any data to be rendered in a template, either immediately or at a later time.


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
In React all event handlers are plain-old functions. So, if you have a stream and you want to trigger it, you must do the following:

```js
// An Observable Stream
const counter = new BehaviorSubject(0).pipe(
  scan(x=>x+1)
);

const ReactComponent = () => (
  <button onclick={()=>counter.next()}>click</button>
);
```

In Rimmel your event handlers can be strings (like in plain Vanilla), references to functions (like above), or Observable Streams.
In fact, feeding a stream like above is totally discouraged in favour of referencing it directly:

```js
// An Observable Stream
const counter = new BehaviorSubject(0).pipe(
  scan(x=>x+1)
);

const RimmelComponent = () => rml`
  <button onclick="${counter}">click me</button>
`;
```

## Hooks => Streams
In modern React you have hooks to do anything state and/or async.
In Rimmel you don't need any of them, as you can use Promises and Observables directly anywhere in your code.

```js
// An Observable Stream
const counter = new BehaviorSubject(0).pipe(
  scan(x=>x+1)
);

const double = counter.pipe(
  map(x=>2*x)
);

const RimmelComponent = () => rml`
  <button onclick="${counter}">count</button>
  <div data-some-attribute="${counter}">
    ${double}
  </div>
`;
```

More about the many ways you can use streams later.

## Global State => Streams
In React you can use the Context API or various third-party libraries to handle global state management.

In Rimmel you use Observable Streams, a general-purpose interface that suits the problem perfectly.<br>
You can easily create your own streams, otherwise any third-party library that exposes the Observable/Observer interface works.

Some libraries tend to model global state as objects (E.G.: Redux). This is considered an anti-pattern in
Rimmel: state is a stream, which means each "state variable" should be tracked separately, so we don't
have to manage the mess of merging and unmerging values constantly, let alone figuring out what changed and when.

```ts
// we track each state separately
const x = new BehaviorSubject<number>;
const y = new BehaviorSubject<number>;

// if/when we really need both
// we can still combine them together
const pair = combineLatest(x, y);

target.innerHTML = rml`
  <input type="range" oninput="${Value(x)}">
  <input type="range" oninput="${Value(y)}">

  Separate:
  X, Y: <span>${x}</span>, <span>${y}</span>

  Combined:
  Pair: <span>${pair}</span>
`;
```

The `Value(x)` expression is an Event Adapter: it feeds the given stream with `e.target.value` for convenience. More about these lower down.

## Local State => Streams
Local state in Rimmel works exactly the same as global state. Plain, simple streams or promises.

```ts
const destroy = new Subject<Event>;

target.innerHTML = rml`
  <button onclick="${destroy}" rml:removed="${destroy}">
`;
```

`rml:removed` is one of a few _convenience extensions_ to HTML that makes us remove an element when a stream emits, declaratively.


## Re-Rendering => Fine-Grained Updates
Re-rendering is React's strategy to make non-reactive variables work as if they were reactive.
This not only breaks the semantics of the language but also creates many, many problems down the line with performance and makes it particularly difficult to create reactive applications.

In Rimmel there is no such thing as re-rendering. State and Transition is always self-contained in streams, whether using promises or observables, so whenever they emit a value, that's just "sinked" into the DOM directly.
This is often referred-to as fine-grained updates.

## Virtual DOM => Fine-Grained Updates
Reactive streams are light, fast and efficient. The fact they intrinsically keep their state embedded makes the use of a Virtual DOM totally unnecessary. 

## Conditional Rendering vs Conditional Streams
In both React and Rimmel you can use the JavaScript ternary operator to conditionally render different things.

```ts
const ReactComponent = () => (
  <div>
    {
      condition === true
        ? <SomeComponent>
        : <SomeOtherComponent>
    }
  </div>
`;
```

There is an important difference, here, though.
In React, during its re-rendering cycles, the above code will be re-evaluated a number of times, making the above behave like a "live" condition.

This is not the case in Rimmel, where re-rendering or re-evaluation is banned. The above code would only run the first time, just like it would per regular JavaScript semantics.

The way we can create a "live" condition is creating a stream with a condition in it:

```js
const RimmelComponent = new BehaviorSubject(false).pipe(
  map(n =>
    n == false
      ? rml`<div>The condition is false</div>`
      : rml`<button>it's true, click me<button>`
  )
);
```

## Build Tools
React, when using JSX, needs a transpilation step.

Rimmel's syntax is 100% pure standard JavaScript, so it doesn't require any build tools. Of course you can use them optionally as you see fit.

## Lifecycle Events => nothing
React provides a number of lifecycle events/hooks to help initialise/cleanup components.
This is central in imperative programming but comes with an extended bug surface.

Rimmel provides declarative patterns to perform all operations you would normally perform inside lifecycle event handlers, such as setting event handlers, sinks, initial values, etc.

## Side Effects => Extensible Effects
React comes with a number of hooks like `useEffect()`, `use()`, etc, designed to perform all sorts of side effects.

Rimmel and stream-oriented programming encourage the extensible effects pattern, which means effects are
declared but not directly performed by a component.
The actual execution of such effects is left to the framework/libary/environment or helper functionality.

