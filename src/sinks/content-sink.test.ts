import { MockElement } from '../test-support';
import { appendHTMLSink, innerHTMLSink, innerTextSink, textContentSink } from './content-sink';

describe('innerHTML Sink', () => {

    describe('Given any HTML', () => {

        it('sets the innerHTML on sink', () => {
            const el = MockElement();
            const sink = innerHTMLSink(<HTMLElement>el);
            const str = '<div>hello</div>';

            sink(str);
            expect(el.innerHTML).toEqual(str);
        });

        it('replaces existing innerHTML on sink', () => {
            const el = MockElement({ innerHTML: '<div>old text</div>' });
            const sink = innerHTMLSink(<HTMLElement>el);
            const str = '<div>hello</div>';

            sink(str);
            expect(el.innerHTML).toEqual(str);
        });

    });

});

describe('appendHTML Sink', () => {

    describe('Given any HTML', () => {

        it('appends to the innerHTML on sink', () => {
            const str1 = '<div>old text</div>';
            const str2 = '<div>hello</div>';

            const el = MockElement({ innerHTML: str1 });
            const sink = appendHTMLSink(<HTMLElement>el);

            sink(str2);
            expect(el.innerHTML).toEqual(str1 +str2);
        });

    });

});

describe('innerText Sink', () => {

    describe('Given any text', () => {

        it('sets the innerText on sink', () => {
            const el = MockElement();
            const sink = innerTextSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.innerText).toEqual(str);
        });

        it('replaces existing innerText on sink', () => {
            const el = MockElement({ innerHTML: '<div>old text</div>' });
            const sink = innerTextSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.innerText).toEqual(str);
        });

    });

});

describe('textContent Sink', () => {

    describe('Given any text', () => {

        it('sets the textContent on sink', () => {
            const el = MockElement();
            const sink = textContentSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.textContent).toEqual(str);
        });

        it('replaces existing textContent on sink', () => {
            const el = MockElement({ innerHTML: '<div>old text</div>' });
            const sink = textContentSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.textContent).toEqual(str);
        });

    });

});
