import type { RenderingScheduler } from '../types/schedulers';

const queue = new Map();
let averageTaskTime = 0;
const alpha = 0.8; // Adjust smoothing factor as needed
const refreshRate = 1000 / 60; // Assume 60fps - FIXME: don't assume, calculate

const render = (frameStart: DOMHighResTimeStamp) => {
	const frameEnd = frameStart + refreshRate;

	for (const [key, task] of queue) {
		const taskStart = performance.now();
		task();
		const taskDuration = performance.now() - taskStart;

		averageTaskTime = alpha *taskDuration +(1 -alpha) *averageTaskTime;

		queue.delete(key);

		if (performance.now() >= frameEnd) {
			// window.qtt = queue.size;
			// window.att = averageTaskTime;
			break;
		}
	}

	if (queue.size > 0) {
		requestAnimationFrame(render);
	}
};

export default ((node, task) =>
	(...args: any[]) => {
		queue.size || requestAnimationFrame(render);
		queue.set(node, task.bind(null, ...args)); // Update task in the queue
	}
) as RenderingScheduler;