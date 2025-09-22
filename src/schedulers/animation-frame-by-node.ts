import type { RenderingScheduler, RenderingTask } from '../types/schedulers';

const queue = new Map();

const render = (_frameStart: DOMHighResTimeStamp) => {
	for (const [node, task] of queue) {
		task();
	};
	// window.qtt = queue.size;
	// window.att = (performance.now() - frameStart)/queue.size;
	queue.clear();
};

/**
 * A debounced batch-rendering scheduler that runs the latest rendering task for each given node at the next animation frame
 **/
export default ((node, task) =>
	(...args: any[]) => {
		queue.size || requestAnimationFrame(render);
		queue.set(node, task.bind(null, ...args));
	}
) as RenderingScheduler;

