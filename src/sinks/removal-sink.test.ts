import { MockElement } from '../test-support';
import { RemovalSink } from './removal-sink';

describe('Removal Sink', () => {

    describe('Given an element', () => {

        it('removes the element on sink', () => {
            const el = MockElement();
            el.remove = jest.fn();
            const sink = RemovalSink(<HTMLElement>el);

            sink(true);
            expect(el.remove).toHaveBeenCalled();
        });

    });

});
