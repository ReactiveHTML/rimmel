import { rml } from 'rimmel';
import { BehaviorSubject } from 'rxjs';
import { scan } from 'rxjs/operators';

/**
 * A Rimmel component with internal reactive state and external props.
 * This demonstrates:
 * - Internal state management with RxJS observables
 * - Receiving external props as observables
 * - No re-rendering - updates happen through reactive streams
 */
export const ClickCounter = ({ externalCounter }: { externalCounter: any }) => {
  // Internal reactive state - counts button clicks
  const count = new BehaviorSubject(0).pipe(
    scan((x: number) => x + 1)
  );

  return rml`
    <div>
      <p><strong>Internal Rimmel State:</strong></p>
      <button onclick="${count}">Click me!</button>
      <span>Clicks: <output>${count}</output></span>
      
      <p style="margin-top: 1rem;"><strong>External React Prop:</strong></p>
      <span>External counter: <output>${externalCounter}</output></span>
      
      <p style="margin-top: 1rem; font-size: 0.9em; color: #6c757d;">
        💡 Try clicking the "Increment External Counter" button above and watch 
        this value update without re-rendering the component!
      </p>
    </div>
  `;
};
