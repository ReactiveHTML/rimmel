import { MockElement } from '../test-support';
import { ValueSink } from './value-sink'

describe('Value Sink', () => {

    describe('Given a string', () => {

        it('should set .value on sink', () => {
            // N.B.: this won't, and is not expected to set
            // the "value" attribute in the HTML
            const el = MockElement()
            const sink = ValueSink(<HTMLInputElement>el)

            const str = 'hello, world'
            sink(str)
            expect(el.value).toEqual(str);

        });

    });

});
