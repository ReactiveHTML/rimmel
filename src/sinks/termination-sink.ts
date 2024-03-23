// TODO: what should happen (if anything at all?) when an observable terminates?
// Remove the node?
// Emit empty?
//const terminationSink = (node)   => node.remove();

/**
 * Experimental sink for terminating observables
 */
export const terminationHandler = () =>
    () => {
        // console.debug('Rimmel: NOOP termination sink called', data);
    }
