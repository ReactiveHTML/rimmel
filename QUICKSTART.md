## Quick Start

### Installation

```bash
# Using npm
npm install rimmel rxjs

# Using yarn 
yarn add rimmel rxjs

# Using pnpm
pnpm add rimmel rxjs
```

### Basic Usage

```js
import { BehaviorSubject, scan } from 'rxjs';
import { rml } from 'rimmel';

const Component = () => {
  const count = new BehaviorSubject(0).pipe(
    scan(x=>x+1)
  );
  
  return rml`
    <button onclick="${count}">
      click me (${count})
    </button>
  `;
};

const App = () => {
  return rml`
    <h1>Hello <img class="icon" src="https://rimmel.js.org/assets/rimmel.png"> World</h1>
    ${Component()}

    <hr>
    Starter for <a href="https://github.com/reactivehtml/rimmel" target="_blank">Rimmel.js</a>
  `;  
};

document.body.innerHTML = App();
```

## Key Features

- **Stream-First Architecture**: Everything is a stream - events, data, UI updates
- **No Virtual DOM**: Direct DOM updates via optimized "sinks"
- **Tiny Bundle Size**: Core is just 2.5KB, tree-shakeable imports
- **Zero Build Requirements**: Works with plain JavaScript
- **Automatic Memory Management**: Handles subscription cleanup
- **Built-in Suspense**: Automatic loading states with BehaviorSubject
- **Web Components Support**: Create custom elements easily
- **TypeScript Support**: Full type definitions included

## Core Concepts

### Sources (Input)
- DOM Events (`onclick`, `onmousemove`, etc)
- Promises 
- RxJS Observables
- Custom Event Sources

### Sinks (Output)
- DOM Updates
- Class Management
- Style Updates
- Attribute Changes
- Custom Sinks

## Available Sinks

The library includes specialized sinks for common UI operations:

- `InnerHTML` - Update element content 
- `InnerText` - Safe text updates
- `Class` - Manage CSS classes
- `Style` - Update styles
- `Value` - Form input values
- `Disabled` - Toggle disabled state
- `Readonly` - Toggle readonly state
- `Removed` - Remove elements
- `Sanitize` - Safe HTML rendering
- `AppendHTML` - Append content
- `PrependHTML` - Prepend content

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build library
npm run build

# Run demo app
npm run kitchen-sink
```

## Examples

Check out our examples:

- [Basic Demos](https://stackblitz.com/@dariomannu/collections/rimmel-js-getting-started)
- [Advanced Patterns](https://stackblitz.com/@dariomannu/collections/rimmel-js-experiments) 
- [Web Components](https://stackblitz.com/@dariomannu/collections/web-components)
- [Web Workers](https://stackblitz.com/@dariomannu/collections/web-workers)