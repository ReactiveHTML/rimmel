import { MockElement } from '../test-support';
import { RemovedSink } from './removed-sink';

describe('Removed Sink', () => {

    describe('Given an element', () => {

        it('removes the element on sink', () => {
            const el = MockElement();
            el.remove = jest.fn();
            const sink = RemovedSink(<HTMLElement>el);

            sink(true);
            expect(el.remove).toHaveBeenCalled();
        });

    });

});
