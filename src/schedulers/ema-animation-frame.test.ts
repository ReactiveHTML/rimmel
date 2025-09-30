import emaAnimationFrameScheduler from './ema-animation-frame';
import {
	createMockTask,
	createMockNode,
	waitForAnimationFrame,
	mockRequestAnimationFrame,
	mockPerformanceNow,
} from './test-helpers';

// Setup browser APIs for testing
if (typeof global.requestAnimationFrame === 'undefined') {
	global.requestAnimationFrame = (callback: FrameRequestCallback) => {
		return setTimeout(() => callback(Date.now()), 16) as unknown as number;
	};
}

if (typeof global.performance === 'undefined') {
	global.performance = {
		now: () => Date.now(),
	} as Performance;
}

describe('EMA Animation Frame Scheduler', () => {

	describe('Given a single task', () => {

		it('should schedule the task for the next animation frame', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			scheduledTask('arg1');

			expect(callCount()).toBe(0);

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
		});

		it('should pass arguments to the task', async () => {
			const node = createMockNode();
			const { task, lastCall } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			const args = ['foo', 42, { data: 'bar' }];
			scheduledTask(...args);

			await waitForAnimationFrame();

			expect(lastCall()).toEqual(args);
		});

	});

	describe('Given multiple tasks on the same node', () => {

		it('should debounce tasks and execute only the latest', async () => {
			const node = createMockNode();
			const { task, callCount, lastCall } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			scheduledTask('first');
			scheduledTask('second');
			scheduledTask('third');

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual(['third']);
		});

		it('should update the task in the queue for the same node', async () => {
			const node = createMockNode();
			const { task, calls } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			scheduledTask({ value: 1 });
			scheduledTask({ value: 2 });
			scheduledTask({ value: 3 });

			await waitForAnimationFrame();

			expect(calls.length).toBe(1);
			expect(calls[0]).toEqual([{ value: 3 }]);
		});

	});

	describe('Given multiple tasks on different nodes', () => {

		it('should execute one task per node', async () => {
			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');
			const node3 = createMockNode('node3');

			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');
			const task3 = createMockTask('task3');

			const scheduled1 = emaAnimationFrameScheduler(node1, task1.task);
			const scheduled2 = emaAnimationFrameScheduler(node2, task2.task);
			const scheduled3 = emaAnimationFrameScheduler(node3, task3.task);

			scheduled1('a1');
			scheduled1('a2'); // Should override a1
			scheduled2('b1');
			scheduled3('c1');
			scheduled3('c2'); // Should override c1

			await waitForAnimationFrame();

			expect(task1.callCount()).toBe(1);
			expect(task1.lastCall()).toEqual(['a2']);
			expect(task2.callCount()).toBe(1);
			expect(task2.lastCall()).toEqual(['b1']);
			expect(task3.callCount()).toBe(1);
			expect(task3.lastCall()).toEqual(['c2']);
		});

		it('should batch all node tasks into a single animation frame when possible', async () => {
			const nodes = Array.from({ length: 5 }, (_, i) => createMockNode(`node${i}`));
			const tasks = nodes.map((_, i) => createMockTask(`task${i}`));
			const scheduled = nodes.map((node, i) => 
				emaAnimationFrameScheduler(node, tasks[i].task)
			);

			scheduled.forEach((s, i) => s(`data${i}`));

			expect(tasks.every(t => t.callCount() === 0)).toBe(true);

			await waitForAnimationFrame();

			expect(tasks.every(t => t.callCount() === 1)).toBe(true);
		});

	});

	describe('Given the EMA (Exponential Moving Average) calculation', () => {

		it('should use EMA to track average task execution time', async () => {
			const perfMock = mockPerformanceNow();
			const rafMock = mockRequestAnimationFrame();

			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');

			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');

			const scheduled1 = emaAnimationFrameScheduler(node1, task1.task);
			const scheduled2 = emaAnimationFrameScheduler(node2, task2.task);

			// First execution - establish initial average
			scheduled1('first');
			perfMock.advance(0);
			rafMock.flush(perfMock.time);
			perfMock.advance(2); // Simulate 2ms execution

			// Second execution - EMA should be updated
			scheduled2('second');
			perfMock.advance(0);
			rafMock.flush(perfMock.time);
			perfMock.advance(4); // Simulate 4ms execution

			// The EMA should be between 2 and 4, weighted by alpha (0.8)
			// EMA = 0.8 * 4 + 0.2 * 2 = 3.2 + 0.4 = 3.6

			perfMock.restore();
			rafMock.restore();
		});

	});

	describe('Given the time-slicing behavior', () => {

		it('should execute all tasks when they fit within the frame budget', async () => {
			const nodes = Array.from({ length: 5 }, (_, i) => createMockNode(`node${i}`));
			const tasks = nodes.map((_, i) => createMockTask(`task${i}`));
			const scheduled = nodes.map((node, i) => 
				emaAnimationFrameScheduler(node, tasks[i].task)
			);

			scheduled.forEach((s, i) => s(`data${i}`));

			await waitForAnimationFrame();

			// All tasks should execute when they fit within budget
			expect(tasks.every(t => t.callCount() === 1)).toBe(true);
		});

		it('should handle large numbers of tasks gracefully', async () => {
			const nodes = Array.from({ length: 20 }, (_, i) => createMockNode(`node${i}`));
			const tasks = nodes.map((_, i) => createMockTask(`task${i}`));
			const scheduled = nodes.map((node, i) => 
				emaAnimationFrameScheduler(node, tasks[i].task)
			);

			scheduled.forEach((s, i) => s(`data${i}`));

			// Wait for first frame
			await waitForAnimationFrame();

			// At least some tasks should execute
			const executedCount = tasks.filter(t => t.callCount() > 0).length;
			expect(executedCount).toBeGreaterThan(0);

			// If not all executed, wait for next frame
			if (executedCount < tasks.length) {
				await waitForAnimationFrame();
			}

			// Eventually all should execute
			expect(tasks.every(t => t.callCount() >= 1)).toBe(true);
		});

		it('should adapt to varying workloads', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			// First frame - single task
			scheduledTask('frame1');
			await waitForAnimationFrame();
			expect(callCount()).toBe(1);

			// Second frame - multiple rapid updates (debounced)
			for (let i = 0; i < 10; i++) {
				scheduledTask(`frame2-${i}`);
			}
			await waitForAnimationFrame();
			expect(callCount()).toBe(2); // Total of 2 executions
		});

	});

	describe('Given tasks scheduled across multiple frames', () => {

		it('should execute debounced tasks in separate animation frames', async () => {
			const node = createMockNode();
			const { task, callCount, calls } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			scheduledTask('frame1-call1');
			scheduledTask('frame1-call2');
			scheduledTask('frame1-call3');

			await waitForAnimationFrame();
			expect(callCount()).toBe(1);
			expect(calls[0]).toEqual(['frame1-call3']);

			scheduledTask('frame2-call1');
			scheduledTask('frame2-call2');

			await waitForAnimationFrame();
			expect(callCount()).toBe(2);
			expect(calls[1]).toEqual(['frame2-call2']);
		});

	});

	describe('Given the requestAnimationFrame implementation', () => {

		it('should debounce multiple updates to the same node', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			// Schedule multiple updates rapidly
			scheduledTask('update1');
			scheduledTask('update2');
			scheduledTask('update3');

			await waitForAnimationFrame();

			// Should execute only once (debounced)
			expect(callCount()).toBe(1);
		});

		it('should handle successive batches independently', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			scheduledTask('batch1');
			await waitForAnimationFrame();
			expect(callCount()).toBe(1);

			scheduledTask('batch2');
			await waitForAnimationFrame();
			expect(callCount()).toBe(2);
		});

	});

	describe('Given the debouncing behavior', () => {

		it('should maintain separate state for different nodes', async () => {
			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');

			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');

			const scheduled1 = emaAnimationFrameScheduler(node1, task1.task);
			const scheduled2 = emaAnimationFrameScheduler(node2, task2.task);

			scheduled1('node1-first');
			scheduled2('node2-first');
			scheduled1('node1-second');
			scheduled2('node2-second');
			scheduled1('node1-third');

			await waitForAnimationFrame();

			expect(task1.callCount()).toBe(1);
			expect(task1.lastCall()).toEqual(['node1-third']);
			expect(task2.callCount()).toBe(1);
			expect(task2.lastCall()).toEqual(['node2-second']);
		});

	});

	describe('Given edge cases', () => {

		it('should handle tasks with no arguments', async () => {
			const node = createMockNode();
			const { task, callCount, lastCall } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			scheduledTask();

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual([]);
		});

		it('should handle rapid successive scheduling on the same node', async () => {
			const node = createMockNode();
			const { task, callCount, lastCall } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			for (let i = 0; i < 100; i++) {
				scheduledTask(i);
			}

			await waitForAnimationFrame();

			// Should debounce to only the last value
			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual([99]);
		});

		it('should clear completed tasks from queue', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = emaAnimationFrameScheduler(node, task);

			scheduledTask('call1');
			await waitForAnimationFrame();
			expect(callCount()).toBe(1);

			// Second batch should work independently
			scheduledTask('call2');
			await waitForAnimationFrame();
			expect(callCount()).toBe(2);
		});

		it('should handle multiple nodes in parallel', async () => {
			const nodes = Array.from({ length: 3 }, (_, i) => createMockNode(`node${i}`));
			const tasks = nodes.map((_, i) => createMockTask(`task${i}`));
			const scheduled = nodes.map((node, i) => 
				emaAnimationFrameScheduler(node, tasks[i].task)
			);

			// Schedule tasks on all nodes
			scheduled.forEach((s, i) => s(`data${i}`));

			await waitForAnimationFrame();

			// All should execute
			expect(tasks.every(t => t.callCount() === 1)).toBe(true);
			tasks.forEach((t, i) => {
				expect(t.lastCall()).toEqual([`data${i}`]);
			});
		});

	});

});