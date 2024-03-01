import { MockElement } from '../test-support';
import { selectedIndexSink } from './selected-index-sink';

describe('selectedIndex Sink', () => {

    describe('Given a number', () => {

        it('sets the the corresponding selectedIndex on sink', () => {
            const el = MockElement();
            const sink = selectedIndexSink(<HTMLSelectElement>el);

            sink(1);
            expect(el.selectedIndex).toEqual(1);

            sink(3);
            expect(el.selectedIndex).toEqual(3);
        });

    });

});
