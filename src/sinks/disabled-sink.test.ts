import { MockElement } from '../test-support';
import { DisabledSink } from './disabled-sink';

describe('disabled Sink', () => {

    describe('Given a boolean', () => {

        it('sets the the readonly attribute on sink', () => {
            const el = MockElement();
            const sink = DisabledSink(<HTMLInputElement>el);

            sink(true);
            expect(el.disabled).toEqual('disabled');
            expect(el.getAttribute('disabled')).toEqual('disabled');
        });

        it('clears the the readonly attribute on falsy', () => {
            const el = MockElement();
            const sink = DisabledSink(<HTMLInputElement>el);

            sink(true);
            sink(false);
            expect(el.getAttribute('disabled')).toBeUndefined();

            sink(true);
            sink(undefined);
            expect(el.getAttribute('disabled')).toBeUndefined();

            sink(true);
            sink(0);
            expect(el.getAttribute('disabled')).toBeUndefined();
        });

    });

});
