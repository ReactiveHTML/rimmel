import { MockElement } from '../test-support';
import { PrependHTMLSink } from './prepend-html-sink';

describe('PrependHTML Sink', () => {

    describe('Given any HTML', () => {

        it('prepends to the innerHTML on sink', () => {
            const str1 = '<div>old text</div>';
            const str2 = '<div>hello</div>';

            const el = MockElement({ innerHTML: str1 });
            const sink = PrependHTMLSink(<HTMLElement>el);

            sink(str2);
            expect(el.innerHTML).toEqual(str2 +str1);
        });

    });

});



