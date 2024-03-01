// import { describe } from 'node:test'
import { MockElement } from '../test-support';
import { checkedSink } from './checked-sink';

describe('Checked Sink', () => {

    describe('Given a boolean', () => {

        it('sets the the checked attribute on sink', () => {
            const el = MockElement();
            const sink = checkedSink(<HTMLInputElement>el);

            sink(true);
            expect(el.checked).toEqual(true);
            expect(el.getAttribute('checked')).toEqual(true);
        });

        it('clears the the readonly attribute on falsey', () => {
            const el = MockElement();
            const sink = checkedSink(<HTMLInputElement>el);

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
