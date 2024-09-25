import { MockElement } from '../test-support';
import { DisabledSink } from './disabled-sink';

describe('disabled Sink', () => {

    describe('Given a boolean', () => {

        it('sets the the readonly attribute on sink', () => {
            const el = MockElement();
            const sink = DisabledSink(<HTMLInputElement>el);

            sink(true);
            expect(el.disabled).toEqual(true);
        });

        it('clears the the readonly attribute on falsy', () => {
            const el = MockElement();
            const sink = DisabledSink(<HTMLInputElement>el);

            sink(true);
            sink(false);
            expect(el.disabled).not.toEqual(true);

            sink(true);
            sink(undefined);
            expect(el.disabled).not.toEqual(true);

            sink(true);
            sink(0);
            expect(el.disabled).not.toEqual(true);
        });

    });

});
