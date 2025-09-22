import { MockElement } from '../test-support';
import { StyleSink, StyleObjectSink } from './style-sink'

describe('Style Sink', () => {

    describe('Given a CSS property', () => {

        it('should set the property on sink', () => {
            const el = MockElement()
            const sink = StyleSink(<HTMLElement>el, 'color')

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
            const sink = StyleObjectSink(el)

            sink({ color: 'red'})
            expect(el.style.color).toEqual('red');
        });

        it('clears properties with undefined values', () => {
            const el = MockElement({style: {color: 'red'}})
            const sink = StyleObjectSink(el)

            sink({ color: 'red', background: 'blue'});
            expect(el.style.color).toEqual('red');
            expect(el.style.background).toEqual('blue');

            sink({ color: undefined})
            expect(el.style.color).toEqual(undefined);
            expect(el.style.background).toEqual('blue');
        });

    });

});
