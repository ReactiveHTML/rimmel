export type Sink = (...args: any[]) => any;

export type SinkFactory = (node: HTMLElement, ...args: any[]) => Sink;

export type MaybeObservable = {
  subscribe: (args: any[]) => void;
}

export type MaybeObserver = {
  next: (args: any[]) => void;
}

export type MaybePromise = {
  then: (args: any[]) => void;
}

// TODO: add NaN
export type falsy = false | 0 | '' | null | undefined; // | NaN

export type truthy = unknown;

export type ClassSet = {
  [key: string]: truthy | falsy;
}

export enum SinkType {
  'innerHTML',
	'innerText',
	'style',
	'attribute',
	'attributeset',
	'class',
	'dataset',
	'multidataset',
}

export enum SourceType {
  'event',
}

export type EventHandlerFunction = (event: Event) => any;

export type ElementBindingConfig = {
  handler: EventHandlerFunction | MaybeObservable | MaybeObserver | MaybePromise,
  type: SinkType | SourceType,
  eventName: string;
}
