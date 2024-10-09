import { MockElement } from '../test-support';
import { SanitizeSink } from './sanitize-html-sink';

describe('Sanitize Sink', () => {

    describe('Given any HTML', () => {

        it.skip('removes all XSS vectors', () => {
            const el = MockElement();
            const sink = SanitizeSink(<HTMLElement>el);
            const str = `<div>hello <script>alert("xss")</script> <img onerror="alert('hack')" src="data:xxx"></div>`;
            const expected = `<div>hello <img src="data:xxx"></div>`;

            sink(str);
            expect(el.innerHTML).toEqual(expected);
        });

    });

});