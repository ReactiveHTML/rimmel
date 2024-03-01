// import { describe } from 'node:test'
import { MockElement } from '../test-support';
import { styleSink, styleMultiSink } from './style-sink'

describe('Style Sink', () => {

    describe('Given a CSS property', () => {

        it('should set the property on sink', () => {
            const el = MockElement()
            const sink = styleSink(<HTMLElement>el, 'color')

            sink('red')
            expect(el.style.color).toEqual('red');
            sink('blue')
            expect(el.style.color).toEqual('blue');

        });

    });

});

describe('Style Object Sink', () => {

    describe('when given a Style Object', () => {

        it('sets properties', () => {
            const el = MockElement()
            const sink = styleMultiSink(el)

            sink({ color: 'red'})
            expect(el.style.color).toEqual('red');
        });

        it('clears properties with undefined values', () => {
            const el = MockElement({style: {color: 'red'}})
            const sink = styleMultiSink(el)

            sink({ color: 'red', background: 'blue'})
            expect(el.style.color).toEqual('red');
            expect(el.style.background).toEqual('blue');

            sink({ color: undefined})
            expect(el.style.color).toEqual(undefined);
            expect(el.style.background).toEqual('blue');
        });

    });

});
