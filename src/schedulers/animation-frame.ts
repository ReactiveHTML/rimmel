import type { RenderingScheduler, RenderingTask } from '../types/schedulers';

const queue = new Set<RenderingTask>();

const render = (frameStart: DOMHighResTimeStamp) => {
	for (const task of queue) {
		task();
	};
	// window.qtt = queue.size;
	// window.att = (performance.now() - frameStart)/queue.size;
	queue.clear();
};

/**
 * A basic batch-rendering scheduler that renders all tasks
 * at the next animation frame.
 * Suitable for simple to medium workloads where all rendering
 * tasks can be performed in one rendering frame
 **/
export default ((_node, task) =>
	((...args: any[]) => {
		queue.size || requestAnimationFrame(render);
		queue.add(task.bind(null, ...args));
	})
) as RenderingScheduler;

