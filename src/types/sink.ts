/**
 * The mounted part of a Sink who performs the actual work, e.g.: DOM updates, console.logs, etc.
 * This is always created by a Sink first.
 */
export type SinkFunction = (values?: any) => void;


/**
 * A module responsible to display data coming from a stream
 * @param T The type of HTML element the sink can be applied to
 */
export interface Sink<T extends Element | HTMLElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement> extends Function {
    (node: T, ...args: any[]): SinkFunction;
    sink?: string;
}

// TODO: use a Symbol?
export const isSink = (x: any): x is Sink<any> => !!x.sink;
