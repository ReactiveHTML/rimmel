import scheduler from './adaptive-animation-frame';
import { MockElement } from '../test-support';
import { installFakeRAF } from './test-support-raf';

describe('AdaptiveAnimationFrame Scheduler', () => {
  let raf = installFakeRAF();

  beforeEach(() => {
    raf = installFakeRAF();
  });

  afterEach(() => {
    raf.restore();
  });

  describe('Given multiple heavy tasks in one tick', () => {
    it('spreads work across multiple frames based on budget', () => {
      const nodeA = MockElement();
      const nodeB = MockElement();
      const nodeC = MockElement();

      const calls: string[] = [];

      const scheduleA = scheduler(nodeA as unknown as Node, () => { calls.push('A'); raf.advance(10); });
      const scheduleB = scheduler(nodeB as unknown as Node, () => { calls.push('B'); raf.advance(10); });
      const scheduleC = scheduler(nodeC as unknown as Node, () => { calls.push('C'); raf.advance(10); });

      scheduleA();
      scheduleB();
      scheduleC();

      expect(calls).toEqual([]);
      expect(raf.scheduledCount()).toBe(1);

      raf.runFrame();
      expect(calls).toEqual(['A']);

      raf.runFrame();
      expect(calls).toEqual(['A', 'B']);

      raf.runFrame();
      expect(calls).toEqual(['A', 'B', 'C']);
      expect(raf.pending()).toBe(0);
    });
  });
});
