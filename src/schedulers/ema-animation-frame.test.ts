import scheduler from './ema-animation-frame';
import { MockElement } from '../test-support';
import { installFakeRAF } from './test-support-raf';

describe('EMA AnimationFrame Scheduler', () => {
  let raf = installFakeRAF();

  beforeEach(() => {
    raf = installFakeRAF();
  });

  afterEach(() => {
    raf.restore();
  });

  describe('Given heavy tasks relative to frame budget', () => {
    it('reschedules remaining work across subsequent frames', () => {
      const nodeA = MockElement();
      const nodeB = MockElement();
      const nodeC = MockElement();

      const calls: string[] = [];

      const heavy = (label: string) => () => { calls.push(label); raf.advance(20); };

      const scheduleA = scheduler(nodeA as unknown as Node, heavy('A'));
      const scheduleB = scheduler(nodeB as unknown as Node, heavy('B'));
      const scheduleC = scheduler(nodeC as unknown as Node, heavy('C'));

      scheduleA();
      scheduleB();
      scheduleC();

      expect(calls).toEqual([]);
      expect(raf.scheduledCount()).toBe(1);

      // First frame should process only the first heavy task
      raf.runFrame();
      expect(calls).toEqual(['A']);

      // Second frame: next heavy task
      raf.runFrame();
      expect(calls).toEqual(['A', 'B']);

      // Third frame: last heavy task
      raf.runFrame();
      expect(calls).toEqual(['A', 'B', 'C']);
      expect(raf.pending()).toBe(0);
    });
  });
});
