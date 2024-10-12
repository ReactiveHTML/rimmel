import { MockElement } from '../test-support';
import { InnerHTMLSink } from './inner-html-sink';

describe('InnerHTML Sink', () => {

    describe('Given any HTML', () => {

        it('sets the innerHTML on sink', () => {
            const el = MockElement();
            const sink = InnerHTMLSink(<HTMLElement>el);
            const str = '<div>hello</div>';

            sink(str);
            expect(el.innerHTML).toEqual(str);
        });

        it('replaces existing innerHTML on sink', () => {
            const el = MockElement({ innerHTML: '<div>old text</div>' });
            const sink = InnerHTMLSink(<HTMLElement>el);
            const str = '<div>hello</div>';

            sink(str);
            expect(el.innerHTML).toEqual(str);
        });

    });

});

