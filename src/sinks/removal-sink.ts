import { Sink } from "../types/sink";

/**
 * A sink that removes the element from the DOM
 * @param e A DOM element
 * @returns 
 */
export const RemovalSink: Sink<Element> = (e: Element) =>
    () => {
        e.remove();
    };
