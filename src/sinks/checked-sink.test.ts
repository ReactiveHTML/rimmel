import { MockElement } from '../test-support';
import { CheckedSink } from './checked-sink';

describe('Checked Sink', () => {

    describe('Given a boolean', () => {

        it('sets the the checked attribute on sink', () => {
            const el = MockElement();
            const sink = CheckedSink(<HTMLInputElement>el);

            sink(true);
            expect(el.checked).toEqual(true);
            expect(el.getAttribute('checked')).toEqual(true);
        });

        it('clears the the readonly attribute on falsy', () => {
            const el = MockElement();
            const sink = CheckedSink(<HTMLInputElement>el);

            sink(true);
            sink(false);
            expect(el.getAttribute('checked')).toEqual(false);

            sink(true);
            sink(undefined);
            expect(el.getAttribute('checked')).toEqual(false);

            sink(true);
            sink(0);
            expect(el.getAttribute('checked')).toEqual(false);
        });

    });

});
