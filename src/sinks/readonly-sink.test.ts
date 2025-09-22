import { MockElement } from '../test-support';
import { ReadonlySink } from './readonly-sink';

describe('Readonly Sink', () => {

    describe('Given a boolean', () => {

        it('sets the the readonly attribute on sink', () => {
            const el = MockElement();
            const sink = ReadonlySink(<HTMLInputElement>el);

            sink(true);
            expect(el.readOnly).toEqual(true);
        });

        it('clears the the readonly attribute on falsy', () => {
            const el = MockElement();
            const sink = ReadonlySink(<HTMLInputElement>el);

            sink(true);
            sink(false);
            expect(el.readOnly).not.toEqual(true);

            sink(true);
            sink(undefined);
            expect(el.readOnly).not.toEqual(true);

            sink(true);
            sink(0);
            expect(el.readOnly).not.toEqual(true);
        });

    });

});
