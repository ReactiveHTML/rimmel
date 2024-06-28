import type { ExplicitSink, Sink } from "../types/sink";

/**
 * A sink that closes a <dialog> when called
 * @param node An HTMLDialogElement
 * @returns 
 */
export const ClosedSink: Sink<HTMLDialogElement> = (node: HTMLDialogElement) => {
    return () => {
        node.close();
    };
};

/**
 * An explicit sink that closes a <dialog> when called
 * @param node An HTMLDialogElement
 * @returns 
 */
export const Closed: ExplicitSink<'closed'> = (v: RMLTemplateExpressions.Any) => ({
    type: 'closed', // Do we need this?
    sink: ClosedSink,
    source: v,
});
