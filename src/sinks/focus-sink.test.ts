import { MockElement } from '../test-support';
import { FocusSink } from './focus-sink';

describe('Focus Sink', () => {

    it('focuses the element when a truthy value is sinked', () => {
        const el = MockElement();
        let call1 = false;
        let call2 = false;
        el.focus = () => call1 = true;
        el.blur = () => call2 = true;

        const sink = FocusSink(<HTMLElement>el);
        sink(true);

        expect(call1).toBe(true);
        expect(call2).toBe(false);
    });

    it('blurs the element when a falsy value is sinked', () => {
        const el = MockElement();
        let call1 = false;
        let call2 = false;
        el.focus = () => call1 = true;
        el.blur = () => call2 = true;

        const sink = FocusSink(<HTMLElement>el);
        sink(false);

        expect(call1).toBe(false);
        expect(call2).toBe(true);
    });

});

