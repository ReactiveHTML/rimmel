import animationFrameByNodeScheduler from './animation-frame-by-node';
import {
	createMockTask,
	createMockNode,
	waitForAnimationFrame,
	mockRequestAnimationFrame,
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

describe('Animation Frame By Node Scheduler', () => {

	describe('Given a single task on a node', () => {

		it('should schedule the task for the next animation frame', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = animationFrameByNodeScheduler(node, task);

			scheduledTask('arg1');

			expect(callCount()).toBe(0);

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
		});

		it('should pass arguments to the task', async () => {
			const node = createMockNode();
			const { task, lastCall } = createMockTask();
			const scheduledTask = animationFrameByNodeScheduler(node, task);

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
			const scheduledTask = animationFrameByNodeScheduler(node, task);

			scheduledTask('first');
			scheduledTask('second');
			scheduledTask('third');

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual(['third']);
		});

		it('should override previous scheduled tasks for the same node', async () => {
			const node = createMockNode();
			const { task, calls } = createMockTask();
			const scheduledTask = animationFrameByNodeScheduler(node, task);

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

			const scheduled1 = animationFrameByNodeScheduler(node1, task1.task);
			const scheduled2 = animationFrameByNodeScheduler(node2, task2.task);
			const scheduled3 = animationFrameByNodeScheduler(node3, task3.task);

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

		it('should batch all node tasks into a single animation frame', async () => {
			const nodes = Array.from({ length: 5 }, (_, i) => createMockNode(`node${i}`));
			const tasks = nodes.map((_, i) => createMockTask(`task${i}`));
			const scheduled = nodes.map((node, i) => 
				animationFrameByNodeScheduler(node, tasks[i].task)
			);

			scheduled.forEach((s, i) => s(`data${i}`));

			expect(tasks.every(t => t.callCount() === 0)).toBe(true);

			await waitForAnimationFrame();

			expect(tasks.every(t => t.callCount() === 1)).toBe(true);
		});

	});

	describe('Given tasks scheduled across multiple frames', () => {

		it('should execute debounced tasks in separate animation frames', async () => {
			const node = createMockNode();
			const { task, callCount, calls } = createMockTask();
			const scheduledTask = animationFrameByNodeScheduler(node, task);

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

		it('should request animation frame only once per batch', () => {
			const rafMock = mockRequestAnimationFrame();
			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');
			const { task } = createMockTask();
			
			const scheduled1 = animationFrameByNodeScheduler(node1, task);
			const scheduled2 = animationFrameByNodeScheduler(node2, task);

			scheduled1('call1');
			scheduled2('call2');
			scheduled1('call3');

			expect(rafMock.pendingCount).toBe(1);

			rafMock.flush();
			rafMock.restore();
		});

		it('should not request animation frame if queue is already scheduled', () => {
			const rafMock = mockRequestAnimationFrame();
			const node = createMockNode();
			const { task } = createMockTask();
			const scheduledTask = animationFrameByNodeScheduler(node, task);

			scheduledTask('call1');
			const firstCallCount = rafMock.pendingCount;

			scheduledTask('call2');
			scheduledTask('call3');

			expect(rafMock.pendingCount).toBe(firstCallCount);

			rafMock.flush();
			rafMock.restore();
		});

	});

	describe('Given the debouncing behavior', () => {

		it('should maintain separate state for different nodes', async () => {
			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');

			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');

			const scheduled1 = animationFrameByNodeScheduler(node1, task1.task);
			const scheduled2 = animationFrameByNodeScheduler(node2, task2.task);

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

		it('should allow different tasks for the same node', async () => {
			const node = createMockNode();
			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');

			const scheduled1 = animationFrameByNodeScheduler(node, task1.task);
			const scheduled2 = animationFrameByNodeScheduler(node, task2.task);

			scheduled1('task1-data');
			scheduled2('task2-data');

			await waitForAnimationFrame();

			// The second task should override the first for the same node
			expect(task1.callCount()).toBe(0);
			expect(task2.callCount()).toBe(1);
			expect(task2.lastCall()).toEqual(['task2-data']);
		});

	});

	describe('Given edge cases', () => {

		it('should handle tasks with no arguments', async () => {
			const node = createMockNode();
			const { task, callCount, lastCall } = createMockTask();
			const scheduledTask = animationFrameByNodeScheduler(node, task);

			scheduledTask();

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual([]);
		});

		it('should clear queue after execution', async () => {
			const rafMock = mockRequestAnimationFrame();
			const node = createMockNode();
			const { task } = createMockTask();
			const scheduledTask = animationFrameByNodeScheduler(node, task);

			scheduledTask('call1');
			rafMock.flush();

			// Second batch should request a new animation frame
			scheduledTask('call2');
			expect(rafMock.pendingCount).toBe(1);

			rafMock.flush();
			rafMock.restore();
		});

	});

});
