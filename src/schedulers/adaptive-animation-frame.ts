import type { RenderingScheduler, RenderingTask } from '../types/schedulers';

const queue = new Map();

let averageTaskTime = 0;

const render = () => {
	const startTime = performance.now();
	let remainingTime = 16;

	for (const [node, task] of queue) {
		const taskStart = performance.now();
		task();
		const taskDuration = performance.now() - taskStart;

		averageTaskTime = averageTaskTime
			? (averageTaskTime + taskDuration) / 2
			: taskDuration;

			queue.delete(node);

			remainingTime = 16 - (performance.now() - startTime);

			if (remainingTime < averageTaskTime) {
				// trace queue.size;
				break;
			}
	}

	if (queue.size) {
		requestAnimationFrame(render);
	}
};

export default ((node: Node, task: RenderingTask) =>
	(...args: any[]) => {
		queue.size || requestAnimationFrame(render);
		queue.set(node, task.bind(null, ...args));
	}
) as RenderingScheduler;
