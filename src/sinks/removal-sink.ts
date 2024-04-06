import { Sink } from "../types/sink";

/**
 * A sink that removes the element from the DOM
 * @param e A DOM element
 * @returns 
 */
export const RemovalSink: Sink = (e: Element) =>
    () => {
        e.remove();
    };
