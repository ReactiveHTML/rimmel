import type { RimmelComponent, Inputs } from '../types/internal';
import { BehaviorSubject } from 'rxjs';
import { Rimmel_Bind_Subtree } from '../lifecycle/data-binding';
import * as React from 'react';

/**
 * Wraps a Rimmel component for use in React applications.
 * 
 * The wrapped component:
 * - Converts React props to BehaviorSubject observables
 * - Maintains Rimmel's reactive model without re-rendering
 * - Properly cleans up subscriptions on unmount
 * 
 * @param rimmelComponent - The Rimmel component function to wrap
 * @returns A React component that can be used in JSX
 * 
 * @example
 * ```tsx
 * const ClickCounter = ({ externalCounter }) => {
 *   const count = new BehaviorSubject(0).pipe(scan(x => x + 1));
 *   return rml`
 *     <button onclick="${count}">click</button>
 *     Count: <output>${count}</output>
 *     External counter: <output>${externalCounter}</output>
 *   `;
 * };
 * 
 * const ReactCounter = WrapForReact(ClickCounter);
 * 
 * // In React:
 * <ReactCounter externalCounter={reactState} />
 * ```
 */
export function WrapForReact<P extends Record<string, any> = Record<string, any>>(
  rimmelComponent: RimmelComponent
) {
  return React.forwardRef<HTMLDivElement, P>((props, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const subjectsRef = React.useRef(new Map());
    const isMountedRef = React.useRef(false);

    // Merge external ref with internal ref
    React.useImperativeHandle(ref, () => containerRef.current!);

    // Initialize or update BehaviorSubjects when props change
    React.useEffect(() => {
      const subjects = subjectsRef.current;

      // Create or update subjects for each prop
      Object.keys(props).forEach(key => {
        const propValue = props[key];
        
        if (subjects.has(key)) {
          // Update existing subject
          subjects.get(key)!.next(propValue);
        } else {
          // Create new subject
          subjects.set(key, new BehaviorSubject(propValue));
        }
      });

      // On first mount, render and bind the Rimmel component
      if (!isMountedRef.current && containerRef.current) {
        isMountedRef.current = true;

        // Convert subjects map to inputs object
        const inputs: Inputs = {};
        subjects.forEach((subject: BehaviorSubject<any>, key: string) => {
          inputs[key] = subject;
        });

        // Render the Rimmel component
        const html = rimmelComponent(inputs);
        containerRef.current.innerHTML = html;

        // Bind Rimmel reactive system
        Rimmel_Bind_Subtree(containerRef.current);
      }
    }, [props]);

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        // Complete all subjects to trigger cleanup
        subjectsRef.current.forEach((subject: BehaviorSubject<any>) => {
          subject.complete();
        });
        subjectsRef.current.clear();
      };
    }, []);

    return React.createElement('div', { ref: containerRef });
  });
}
