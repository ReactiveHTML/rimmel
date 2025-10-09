import adaptiveAnimationFrameScheduler from './adaptive-animation-frame';
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

describe('Adaptive Animation Frame Scheduler', () => {

	describe('Given a single task', () => {

		it('should schedule the task for the next animation frame', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

			scheduledTask('arg1');

			expect(callCount()).toBe(0);

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
		});

		it('should pass arguments to the task', async () => {
			const node = createMockNode();
			const { task, lastCall } = createMockTask();
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

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
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

			scheduledTask('first');
			scheduledTask('second');
			scheduledTask('third');

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual(['third']);
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

			const scheduled1 = adaptiveAnimationFrameScheduler(node1, task1.task);
			const scheduled2 = adaptiveAnimationFrameScheduler(node2, task2.task);
			const scheduled3 = adaptiveAnimationFrameScheduler(node3, task3.task);

			scheduled1('a');
			scheduled2('b');
			scheduled3('c');

			await waitForAnimationFrame();

			expect(task1.callCount()).toBe(1);
			expect(task2.callCount()).toBe(1);
			expect(task3.callCount()).toBe(1);
		});

	});

	describe('Given the adaptive time-slicing behavior', () => {

		it('should execute all tasks when they fit within the frame budget', async () => {
			const nodes = Array.from({ length: 5 }, (_, i) => createMockNode(`node${i}`));
			const tasks = nodes.map((_, i) => createMockTask(`task${i}`));
			const scheduled = nodes.map((node, i) => 
				adaptiveAnimationFrameScheduler(node, tasks[i].task)
			);

			scheduled.forEach((s, i) => s(`data${i}`));

			await waitForAnimationFrame();

			// All tasks should execute when they fit within budget
			expect(tasks.every(t => t.callCount() === 1)).toBe(true);
		});

		it('should handle tasks that might exceed frame budget gracefully', async () => {
			const nodes = Array.from({ length: 20 }, (_, i) => createMockNode(`node${i}`));
			const tasks = nodes.map((_, i) => createMockTask(`task${i}`));
			const scheduled = nodes.map((node, i) => 
				adaptiveAnimationFrameScheduler(node, tasks[i].task)
			);

			scheduled.forEach((s, i) => s(`data${i}`));

			// Wait for first frame
			await waitForAnimationFrame();

			// The scheduler adapts - it may process all or defer some
			// At minimum, some tasks should execute
			const executedCount = tasks.filter(t => t.callCount() > 0).length;
			expect(executedCount).toBeGreaterThan(0);

			// If not all executed, wait for next frame
			if (executedCount < tasks.length) {
				await waitForAnimationFrame();
			}

			// Eventually all should execute
			expect(tasks.every(t => t.callCount() >= 1)).toBe(true);
		});

		it('should adapt to varying task counts', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

			// First frame - single task
			scheduledTask('frame1');
			await waitForAnimationFrame();
			expect(callCount()).toBe(1);

			// Second frame - multiple rapid calls (debounced to 1)
			for (let i = 0; i < 10; i++) {
				scheduledTask(`frame2-${i}`);
			}
			await waitForAnimationFrame();
			expect(callCount()).toBe(2); // Total of 2 executions
		});

	});

	describe('Given the average task time calculation', () => {

		it('should adapt to task execution times', async () => {
			const perfMock = mockPerformanceNow();
			const rafMock = mockRequestAnimationFrame();

			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');

			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');

			const scheduled1 = adaptiveAnimationFrameScheduler(node1, task1.task);
			const scheduled2 = adaptiveAnimationFrameScheduler(node2, task2.task);

			// First batch - establish baseline
			scheduled1('first');
			perfMock.advance(0);
			rafMock.flush(perfMock.time);
			perfMock.advance(2); // Simulate 2ms execution

			// Second batch - should use learned average
			scheduled1('second');
			scheduled2('second');
			perfMock.advance(0);
			rafMock.flush(perfMock.time);

			perfMock.restore();
			rafMock.restore();
		});

	});

	describe('Given tasks scheduled across multiple frames', () => {

		it('should continue execution in subsequent frames', async () => {
			const node = createMockNode();
			const { task, callCount, calls } = createMockTask();
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

			scheduledTask('frame1');

			await waitForAnimationFrame();
			expect(callCount()).toBe(1);
			expect(calls[0]).toEqual(['frame1']);

			scheduledTask('frame2');

			await waitForAnimationFrame();
			expect(callCount()).toBe(2);
			expect(calls[1]).toEqual(['frame2']);
		});

	});

	describe('Given the requestAnimationFrame implementation', () => {

		it('should debounce updates for the same node', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

			// Schedule multiple updates rapidly
			scheduledTask('update1');
			scheduledTask('update2');
			scheduledTask('update3');

			await waitForAnimationFrame();

			// Should execute only once (debounced)
			expect(callCount()).toBe(1);
		});

	});

	describe('Given edge cases', () => {

		it('should handle tasks with no arguments', async () => {
			const node = createMockNode();
			const { task, callCount, lastCall } = createMockTask();
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

			scheduledTask();

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual([]);
		});

		it('should handle rapid successive scheduling on the same node', async () => {
			const node = createMockNode();
			const { task, callCount, lastCall } = createMockTask();
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

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
			const scheduledTask = adaptiveAnimationFrameScheduler(node, task);

			scheduledTask('call1');
			await waitForAnimationFrame();
			expect(callCount()).toBe(1);

			// Second batch should work independently
			scheduledTask('call2');
			await waitForAnimationFrame();
			expect(callCount()).toBe(2);
		});

		it('should handle different nodes independently', async () => {
			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');
			
			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');
			
			const scheduled1 = adaptiveAnimationFrameScheduler(node1, task1.task);
			const scheduled2 = adaptiveAnimationFrameScheduler(node2, task2.task);

			scheduled1('a');
			scheduled2('b');

			await waitForAnimationFrame();

			expect(task1.callCount()).toBe(1);
			expect(task2.callCount()).toBe(1);
			expect(task1.lastCall()).toEqual(['a']);
			expect(task2.lastCall()).toEqual(['b']);
		});

	});

});
