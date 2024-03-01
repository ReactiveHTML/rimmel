// import { describe } from 'node:test'
import { MockElement } from '../test-support';
import { valueSink } from './value-sink'

describe('Value Sink', () => {

    describe('Given a CSS property', () => {

        it('should set the property on sink', () => {
            const el = MockElement()
            const sink = valueSink(<HTMLInputElement>el)

            const str = 'hello, world'
            sink(str)
            expect(el.value).toEqual(str);

        });

    });

});