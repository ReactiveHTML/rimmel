/**
 * The mounted part of a Sink who performs the actual work, e.g.: DOM updates, console.logs, etc.
 * This is always created by a Sink first.
 */
export type SinkFunction = (values?: any) => void;

/**
 * A module responsible to display data (e.g.: the DOM, the console, etc)
 */
// export type Sink<T> = (node: T, ...args: SinkParams[]) => SinkFunction;
export interface Sink extends Function {
    (node: Element | HTMLElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement, ...args: any[]): SinkFunction;
    sink?: string;
};

// TODO: use a Symbol?
export const isSink = (x: any): x is Sink => !!x.sink;
