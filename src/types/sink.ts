/**
 * The mounted part of a Sink who performs the actual work, e.g.: DOM updates, console.logs, etc.
 * This is always created by a Sink first.
 */
export type SinkFunction = (values?: any) => undefined;

/**
 * A module responsible to display data (e.g.: the DOM, the console, etc)
 */
export type Sink = (node: HTMLElement, ...args: any[]) => SinkFunction;
