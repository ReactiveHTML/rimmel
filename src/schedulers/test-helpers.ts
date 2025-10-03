/**
 * Test helper utilities for scheduler tests
 */

import type { RenderingTask } from '../types/schedulers';
import { MockElement } from '../test-support';

/**
 * Creates a mock rendering task that tracks execution
 */
export const createMockTask = (name = 'task') => {
	const calls: any[][] = [];
	const task: RenderingTask = (...args: any[]) => {
		calls.push(args);
	};

	return {
		task,
		calls,
		callCount: () => calls.length,
		lastCall: () => calls[calls.length - 1],
		nthCall: (n: number) => calls[n],
		reset: () => calls.length = 0,
	};
};

/**
 * Creates a mock node for testing
 */
export const createMockNode = (name = 'node') => {
	return MockElement({ id: name });
};

/**
 * Waits for the next animation frame
 */
export const waitForAnimationFrame = (): Promise<DOMHighResTimeStamp> => {
	return new Promise(resolve => {
		requestAnimationFrame(resolve);
	});
};

/**
 * Waits for multiple animation frames
 */
export const waitForAnimationFrames = async (count: number): Promise<void> => {
	for (let i = 0; i < count; i++) {
		await waitForAnimationFrame();
	}
};

/**
 * Waits for a specified time in milliseconds
 */
export const wait = (ms: number): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Flushes all pending microtasks and animation frames
 */
export const flushScheduler = async (): Promise<void> => {
	await waitForAnimationFrame();
	await wait(0); // Flush microtasks
};

/**
 * Mock performance.now() for deterministic testing
 */
export const mockPerformanceNow = () => {
	let time = 0;
	const original = performance.now;

	const advance = (ms: number) => {
		time += ms;
	};

	const reset = () => {
		time = 0;
	};

	const restore = () => {
		performance.now = original;
	};

	// Simple mock without jest.fn() for Bun compatibility
	performance.now = (() => time) as typeof performance.now;

	return {
		advance,
		reset,
		restore,
		get time() {
			return time;
		},
	};
};

/**
 * Mock requestAnimationFrame for testing
 */
export const mockRequestAnimationFrame = () => {
	const callbacks: FrameRequestCallback[] = [];
	let frameId = 0;
	const original = global.requestAnimationFrame;

	// Use a simple mock function (Bun compatible)
	global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
		callbacks.push(callback);
		return ++frameId;
	}) as typeof requestAnimationFrame;

	const flush = (time = performance.now()) => {
		const toExecute = [...callbacks];
		callbacks.length = 0;
		toExecute.forEach(cb => cb(time));
	};

	const restore = () => {
		global.requestAnimationFrame = original;
	};

	return {
		flush,
		restore,
		get pendingCount() {
			return callbacks.length;
		},
	};
};
