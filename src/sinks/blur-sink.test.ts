import { MockElement } from '../test-support';
import { BlurSink } from './blur-sink';

describe('Blur Sink', () => {

    it('blurs the element on sink', () => {
        const el = MockElement();
        let call1 = false;
        el.blur = () => call1 = true;

        const sink = BlurSink(<HTMLElement>el);
        sink();

        expect(call1).toBe(true);
    });

});

