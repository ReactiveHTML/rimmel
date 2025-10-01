import scheduler from './animation-frame';
import { MockElement } from '../test-support';
import { installFakeRAF } from './test-support-raf';

describe('AnimationFrame Scheduler', () => {
  let raf = installFakeRAF();

  beforeEach(() => {
    raf = installFakeRAF();
  });

  afterEach(() => {
    raf.restore();
  });

  describe('Given multiple tasks in the same tick', () => {
    it('renders them together on the next frame (single RAF)', () => {
      const node = MockElement();
      const calls: number[] = [];

      const task = (x?: number) => { if (typeof x === 'number') calls.push(x); };
      const schedule = scheduler(node as unknown as Node, task);

      schedule(1);
      schedule(2);

      expect(calls.length).toBe(0);
      expect(raf.scheduledCount()).toBe(1);

      raf.runFrame();

      expect(calls).toEqual([1, 2]);
      expect(raf.pending()).toBe(0);
    });
  });
});
