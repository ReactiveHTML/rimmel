import { MockElement } from '../test-support';
import { TextContentSink } from './text-content-sink';

describe('TextContent Sink', () => {

    describe('Given any text', () => {

        it('sets the textContent on sink', () => {
            const el = MockElement();
            const sink = TextContentSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.textContent).toEqual(str);
        });

        it('replaces existing textContent on sink', () => {
            const el = MockElement({ innerHTML: '<div>old text</div>' });
            const sink = TextContentSink(<HTMLElement>el);
            const str = 'hello';

            sink(str);
            expect(el.textContent).toEqual(str);
        });

    });

});

