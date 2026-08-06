# React Interop Example

This example demonstrates how to use Rimmel components inside a React application using the `WrapForReact` adapter.

## Features

- ✅ Wraps Rimmel components for seamless use in React
- ✅ Converts React props to BehaviorSubject observables
- ✅ Maintains Rimmel's reactive model without re-rendering
- ✅ Proper cleanup on component unmount
- ✅ Bidirectional reactivity across the React-Rimmel boundary

## Installation

```bash
npm install
```

## Running the Example

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## How It Works

### 1. Define a Rimmel Component

```typescript
import { rml } from 'rimmel';
import { BehaviorSubject } from 'rxjs';
import { scan } from 'rxjs/operators';

const ClickCounter = ({ externalCounter }) => {
  const count = new BehaviorSubject(0).pipe(
    scan(x => x + 1)
  );

  return rml`
    <button onclick="${count}">click</button>
    Count: <output>${count}</output>
    External counter: <output>${externalCounter}</output>
  `;
};
```

### 2. Wrap It for React

```typescript
import { WrapForReact } from 'rimmel';

const ReactClickCounter = WrapForReact(ClickCounter);
```

### 3. Use It in React

```tsx
function App() {
  const [externalCounter, setExternalCounter] = useState(0);

  return (
    <div>
      <button onClick={() => setExternalCounter(prev => prev + 1)}>
        Increment
      </button>
      <ReactClickCounter externalCounter={externalCounter} />
    </div>
  );
}
```

## Key Concepts

### No Re-rendering

Unlike typical React components, wrapped Rimmel components render **once** when mounted. All updates happen through reactive streams directly to the DOM, preserving Rimmel's efficient update model.

### Props as Observables

React props are automatically converted to `BehaviorSubject` instances. When a prop changes in React:

1. The wrapper detects the change via `useEffect`
2. It calls `.next()` on the corresponding `BehaviorSubject`
3. The Rimmel component's reactive bindings update the DOM
4. No re-rendering occurs

### Lifecycle Management

The wrapper handles React's lifecycle:

- **Mount**: Renders the Rimmel component and binds reactive subscriptions
- **Update**: Updates `BehaviorSubject` values when props change
- **Unmount**: Completes all subjects and cleans up subscriptions

## Implementation Details

The `WrapForReact` function:

1. Uses `React.forwardRef` to support refs
2. Uses `React.useRef` to store the container and subjects
3. Uses `React.useEffect` to manage lifecycle and prop updates
4. Calls `Rimmel_Bind_Subtree` to activate Rimmel's reactive system
5. Completes all subjects on unmount for proper cleanup

## Browser Compatibility

Same as Rimmel and React requirements:
- Modern browsers with ES6+ support
- MutationObserver API support
