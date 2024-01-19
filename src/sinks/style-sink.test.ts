import { describe } from 'node:test'
import { styleSink } from './style-sink'

describe('Style Sink', () => {

    describe('when given an object', () => {

        it('should set properties', () => {
            const el = document.createElement('div')
            const sink = styleSink(el)

            sink({'color': 'red'})

            expect(el.style.color).toEqual('red');
        });

    });

});
