// TODO: what should happen (if anything) when an observable terminates?
//const terminationSink = (node)   => node.remove()
export const terminationSink = (node: HTMLElement) =>
    (data: string) =>
        console.debug('Rimmel: termination sink', data)
