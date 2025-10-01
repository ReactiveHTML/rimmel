import scheduler from './animation-frame-by-node';
import { MockElement } from '../test-support';
import { installFakeRAF } from './test-support-raf';

describe('AnimationFrameByNode Scheduler', () => {
  let raf = installFakeRAF();

  beforeEach(() => {
    raf = installFakeRAF();
  });

  afterEach(() => {
    raf.restore();
  });

  describe('Given multiple tasks for the same node in one tick', () => {
    it('debounces per node, running only the latest per node', () => {
      const nodeA = MockElement();
      const nodeB = MockElement();

      const calls: Array<[string, number]> = [];

      const scheduleA = scheduler(nodeA as unknown as Node, (v?: number) => { if (typeof v === 'number') calls.push(['A', v]); });
      const scheduleB = scheduler(nodeB as unknown as Node, (v?: number) => { if (typeof v === 'number') calls.push(['B', v]); });

      scheduleA(1);
      scheduleA(2);
      scheduleB(3);

      expect(calls.length).toBe(0);
      expect(raf.scheduledCount()).toBe(1);

      raf.runFrame();

      expect(calls).toEqual([
        ['A', 2],
        ['B', 3],
      ]);
      expect(raf.pending()).toBe(0);
    });
  });
});
