import { MockElement } from '../test-support';
import { InnerTextSink } from './inner-text-sink';

describe('InnerText Sink', () => {

    describe('Given any text', () => {

        it('sets the innerText on sink', () => {
            const el = MockElement();
            const sink = InnerTextSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.innerText).toEqual(str);
        });

        it('replaces existing innerText on sink', () => {
            const el = MockElement({ innerHTML: '<div>old text</div>' });
            const sink = InnerTextSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.innerText).toEqual(str);
        });

    });

});


