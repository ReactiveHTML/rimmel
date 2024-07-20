import { MockElement } from '../test-support';
import { ReadonlySink } from './readonly-sink';

describe('Readonly Sink', () => {

    describe('Given a boolean', () => {

        it('sets the the readonly attribute on sink', () => {
            const el = MockElement();
            const sink = ReadonlySink(<HTMLInputElement>el);

            sink(true);
            expect(el.readonly).toEqual('readonly');
            expect(el.getAttribute('readonly')).toEqual('readonly');
        });

        it('clears the the readonly attribute on falsy', () => {
            const el = MockElement();
            const sink = ReadonlySink(<HTMLInputElement>el);

            sink(true);
            sink(false);
            expect(el.getAttribute('readonly')).toEqual(undefined);

            sink(true);
            sink(undefined);
            expect(el.getAttribute('readonly')).toEqual(undefined);

            sink(true);
            sink(0);
            expect(el.getAttribute('readonly')).toEqual(undefined);
        });

    });

});
