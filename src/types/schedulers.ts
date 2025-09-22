import type { EventListenerFunction } from './dom';
import { SinkFunction } from './sink';

export type RenderingTask =
	| SinkFunction
	// | EventListenerFunction
	// | ((...args: any[]) => void)
;

export type RenderingScheduler = (node: Node, task: RenderingTask) => (...args: any[]) => void;

