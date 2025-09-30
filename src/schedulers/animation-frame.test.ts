import animationFrameScheduler from './animation-frame';
import {
	createMockTask,
	createMockNode,
	waitForAnimationFrame,
	waitForAnimationFrames,
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

describe('Animation Frame Scheduler', () => {

	describe('Given a single task', () => {

		it('should schedule the task for the next animation frame', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			scheduledTask('arg1', 'arg2');

			expect(callCount()).toBe(0);

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
		});

		it('should pass arguments to the task', async () => {
			const node = createMockNode();
			const { task, lastCall } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			const args = ['foo', 42, { data: 'bar' }];
			scheduledTask(...args);

			await waitForAnimationFrame();

			expect(lastCall()).toEqual(args);
		});

	});

	describe('Given multiple tasks on the same node', () => {

		it('should batch all tasks into a single animation frame', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			scheduledTask('call1');
			scheduledTask('call2');
			scheduledTask('call3');

			expect(callCount()).toBe(0);

			await waitForAnimationFrame();

			expect(callCount()).toBe(3);
		});

		it('should execute all tasks in the order they were scheduled', async () => {
			const node = createMockNode();
			const { task, calls } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			scheduledTask('first');
			scheduledTask('second');
			scheduledTask('third');

			await waitForAnimationFrame();

			expect(calls[0]).toEqual(['first']);
			expect(calls[1]).toEqual(['second']);
			expect(calls[2]).toEqual(['third']);
		});

	});

	describe('Given multiple tasks on different nodes', () => {

		it('should execute all tasks in the same animation frame', async () => {
			const node1 = createMockNode('node1');
			const node2 = createMockNode('node2');
			const node3 = createMockNode('node3');

			const task1 = createMockTask('task1');
			const task2 = createMockTask('task2');
			const task3 = createMockTask('task3');

			const scheduled1 = animationFrameScheduler(node1, task1.task);
			const scheduled2 = animationFrameScheduler(node2, task2.task);
			const scheduled3 = animationFrameScheduler(node3, task3.task);

			scheduled1('a');
			scheduled2('b');
			scheduled3('c');

			expect(task1.callCount()).toBe(0);
			expect(task2.callCount()).toBe(0);
			expect(task3.callCount()).toBe(0);

			await waitForAnimationFrame();

			expect(task1.callCount()).toBe(1);
			expect(task2.callCount()).toBe(1);
			expect(task3.callCount()).toBe(1);
		});

	});

	describe('Given tasks scheduled across multiple frames', () => {

		it('should execute tasks in separate animation frames', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			scheduledTask('frame1-call1');
			scheduledTask('frame1-call2');

			await waitForAnimationFrame();
			expect(callCount()).toBe(2);

			scheduledTask('frame2-call1');
			scheduledTask('frame2-call2');

			await waitForAnimationFrame();
			expect(callCount()).toBe(4);
		});

	});

	describe('Given the requestAnimationFrame implementation', () => {

		it('should request animation frame only once per batch', async () => {
			const rafMock = mockRequestAnimationFrame();
			const node = createMockNode();
			const { task } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			scheduledTask('call1');
			scheduledTask('call2');
			scheduledTask('call3');

			expect(rafMock.pendingCount).toBe(1);

			rafMock.flush();
			rafMock.restore();
		});

		it('should not request animation frame if queue is already scheduled', () => {
			const rafMock = mockRequestAnimationFrame();
			const node = createMockNode();
			const { task } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			scheduledTask('call1');
			const firstCallCount = rafMock.pendingCount;

			scheduledTask('call2');
			scheduledTask('call3');

			expect(rafMock.pendingCount).toBe(firstCallCount);

			rafMock.flush();
			rafMock.restore();
		});

	});

	describe('Given edge cases', () => {

		it('should handle tasks with no arguments', async () => {
			const node = createMockNode();
			const { task, callCount, lastCall } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			scheduledTask();

			await waitForAnimationFrame();

			expect(callCount()).toBe(1);
			expect(lastCall()).toEqual([]);
		});

		it('should handle rapid successive scheduling', async () => {
			const node = createMockNode();
			const { task, callCount } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

			for (let i = 0; i < 100; i++) {
				scheduledTask(i);
			}

			await waitForAnimationFrame();

			expect(callCount()).toBe(100);
		});

		it('should clear queue after execution', async () => {
			const rafMock = mockRequestAnimationFrame();
			const node = createMockNode();
			const { task } = createMockTask();
			const scheduledTask = animationFrameScheduler(node, task);

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
