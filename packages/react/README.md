# @rimmel/in-react

React adapter for [Rimmel](https://rimmel.js.org) components. Use Rimmel's reactive, stream-oriented components seamlessly inside React applications.

## Features

- 🔄 **Bidirectional Reactivity**: React props are automatically converted to BehaviorSubject observables
- 🚀 **No Re-rendering**: Maintains Rimmel's efficient reactive model without React re-renders
- 🧹 **Automatic Cleanup**: Proper lifecycle management and subscription cleanup
- 💡 **Lazy Evaluation**: Only creates observables for props that components actually subscribe to
- 📦 **Zero Bloat**: Keep React dependencies isolated from your main Rimmel library

## Installation

```bash
npm install @rimmel/in-react rimmel react rxjs
```

## Usage

### Basic Example

```tsx
import { WrapForReact } from '@rimmel/in-react';
import { rml } from 'rimmel';
import { BehaviorSubject } from 'rxjs';
import { scan } from 'rxjs/operators';

// Define a Rimmel component
const ClickCounter = ({ externalCounter }) => {
  const count = new BehaviorSubject(0).pipe(scan(x => x + 1));
  
  return rml`
    <div>
      <button onclick="${count}">Click me!</button>
      <span>Clicks: <output>${count}</output></span>
      <span>External: <output>${externalCounter}</output></span>
    </div>
  `;
};

// Wrap it for use in React
const ReactClickCounter = WrapForReact(ClickCounter);

// Use it in React components
function App() {
  const [counter, setCounter] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCounter(c => c + 1)}>
        Increment External Counter
      </button>
      <ReactClickCounter externalCounter={counter} />
    </div>
  );
}
```

## How It Works

1. **Props → Observables**: React props are converted to `BehaviorSubject` instances
2. **Lazy Creation**: Subjects are only created when your Rimmel component actually subscribes to them
3. **Reactive Updates**: When React props change, the corresponding BehaviorSubject emits the new value
4. **One-Time Render**: Rimmel component renders once; all updates happen through reactive streams
5. **Clean Teardown**: All subscriptions are properly cleaned up on component unmount

## API

### `WrapForReact<P>(rimmelComponent)`

Wraps a Rimmel component for use in React.

**Parameters:**
- `rimmelComponent`: A Rimmel component function that accepts inputs and returns HTML

**Returns:**
- A React component that can be used in JSX

**Type Parameters:**
- `P`: The props interface (extends `Record<string, any>`)

## Requirements

- React 16.8 or higher (hooks support)
- Rimmel 1.5.0 or higher
- RxJS 7.0 or higher

## License

MIT
