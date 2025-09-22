import { MockElement } from '../test-support';
import { AppendHTMLSink } from './append-html-sink';

describe('AppendHTML Sink', () => {

    describe('Given any HTML', () => {

        it('appends to the innerHTML on sink', () => {
            const str1 = '<div>old text</div>';
            const str2 = '<div>hello</div>';

            const el = MockElement({ innerHTML: str1 });
            const sink = AppendHTMLSink(<HTMLElement>el);

            sink(str2);
            expect(el.innerHTML).toEqual(str1 +str2);
        });

    });

});


