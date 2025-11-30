import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ClickCounter } from './rimmel-components';
import { WrapForReact } from '@rimmel/in-react';

// Wrap the Rimmel component for use in React
const ReactClickCounter = WrapForReact(ClickCounter);

function App() {
    const [externalCounter, setExternalCounter] = useState(0);
    const [showComponent, setShowComponent] = useState(true);

    return (
        <div>
            <h1>React ↔ Rimmel Interop Demo</h1>

            <div className="demo-section">
                <h2>React Controls</h2>
                <p>
                    This section is pure React. Click the button below to update a counter
                    that will be passed as a prop to the Rimmel component.
                </p>
                <button onClick={() => setExternalCounter(prev => prev + 1)}>
                    Increment External Counter
                </button>
                <button onClick={() => setExternalCounter(0)}>
                    Reset External Counter
                </button>
                <button onClick={() => setShowComponent(!showComponent)}>
                    {showComponent ? 'Unmount' : 'Mount'} Rimmel Component
                </button>
                <div style={{ marginTop: '1rem' }}>
                    <strong>React State:</strong> <output>{externalCounter}</output>
                </div>
            </div>

            {showComponent && (
                <div className="demo-section">
                    <h2>Rimmel Component (Wrapped in React)</h2>
                    <p>
                        This component is written in Rimmel and wrapped with <code>WrapForReact()</code>.
                        It has its own internal reactive state (click counter) and receives the external
                        counter from React as an observable prop.
                    </p>
                    <div className="react-wrapper">
                        <ReactClickCounter externalCounter={externalCounter} />
                    </div>
                </div>
            )}

            <div className="explanation">
                <h3>How it works:</h3>
                <ul>
                    <li>
                        <strong>Bidirectional Reactivity:</strong> React props are converted to
                        BehaviorSubjects that Rimmel components can observe.
                    </li>
                    <li>
                        <strong>No Re-rendering:</strong> The Rimmel component renders once.
                        Updates happen through reactive streams, not re-renders.
                    </li>
                    <li>
                        <strong>Independent State:</strong> The "click" button in the Rimmel
                        component has its own reactive state that works independently.
                    </li>
                    <li>
                        <strong>Props Updates:</strong> When React state changes, the
                        BehaviorSubject emits the new value, updating the Rimmel component
                        without re-rendering.
                    </li>
                    <li>
                        <strong>Proper Cleanup:</strong> When you unmount the component, all
                        subscriptions are cleaned up automatically.
                    </li>
                </ul>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
