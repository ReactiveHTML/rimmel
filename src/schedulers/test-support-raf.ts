export type FakeRAF = {
  runFrame: () => void;
  runFrames: (n: number) => void;
  advance: (ms: number) => void;
  setNow: (ms: number) => void;
  now: () => number;
  pending: () => number;
  scheduledCount: () => number;
  restore: () => void;
};

/**
 * Installs a fake requestAnimationFrame + performance.now controller
 * so we can deterministically step frames and time in tests.
 */
export function installFakeRAF(): FakeRAF {
  const originalRAF = globalThis.requestAnimationFrame as any;
  const originalPerf = globalThis.performance as any;
  const originalNow = originalPerf?.now?.bind(originalPerf) ?? (() => 0);

  // Ensure performance exists
  if (!globalThis.performance) {
    (globalThis as any).performance = {} as any;
  }

  let now = 0;
  const queue: FrameRequestCallback[] = [];
  let scheduled = 0;

  // Replace requestAnimationFrame to enqueue callbacks
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback): number => {
    queue.push(cb);
    scheduled++;
    return scheduled;
  };

  // Replace performance.now
  (globalThis.performance as any).now = () => now;

  const runFrame = () => {
    // Execute callbacks scheduled for this frame. New callbacks get queued for next frame.
    const callbacks = queue.splice(0, queue.length);
    for (const cb of callbacks) {
      cb(now as unknown as DOMHighResTimeStamp);
    }
  };

  const runFrames = (n: number) => {
    for (let i = 0; i < n; i++) runFrame();
  };

  const pending = () => queue.length;
  const setNow = (ms: number) => { now = ms; };
  const advance = (ms: number) => { now += ms; };

  const restore = () => {
    if (originalRAF) {
      (globalThis as any).requestAnimationFrame = originalRAF;
    } else {
      delete (globalThis as any).requestAnimationFrame;
    }
    if (originalPerf) {
      (globalThis as any).performance = originalPerf;
      if (originalPerf.now) (globalThis.performance as any).now = originalNow;
    } else {
      delete (globalThis as any).performance;
    }
  };

  return { runFrame, runFrames, advance, setNow, now: () => now, pending, scheduledCount: () => scheduled, restore };
}

