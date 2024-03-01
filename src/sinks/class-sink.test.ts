import { MockElement } from '../test-support';
import { classSink, toggleClass } from './class-sink';

describe('Class Sink', () => {

    describe('Given a class object', () => {

        it('sets classes for truthy attributes on sink', () => {
            const el = MockElement();
            const sink = classSink(<HTMLElement>el);

            sink({
                class1: true,
                class2: 1,
                class3: 'yes!',
            });
            expect(el.className).toContain('class1');
            expect(el.className).toContain('class2');
            expect(el.className).toContain('class3');
        });

        it('clears classes for falsey attributes on sink', () => {
            const el = MockElement({ className: 'class1 class2 class3' });
            const sink = classSink(<HTMLElement>el);
            expect(el.className).toContain('class1');
            expect(el.className).toContain('class2');
            expect(el.className).toContain('class3');

            sink({
                class1: false,
                class2: 0,
                class3: '',
            });
            expect(el.className).not.toContain('class1');
            expect(el.className).not.toContain('class2');
            expect(el.className).not.toContain('class3');
        });

    });

});

describe('Class Toggle Sink', () => {

    describe('Given a class object', () => {

        it('sets classes for truthy value on sink', () => {
            const el = MockElement();
            const sink = toggleClass(<HTMLElement>el, 'class1');

            sink(true);
            expect(el.className).toContain('class1');
        });

        it('clears classes for falsey values on sink', () => {
            const el = MockElement({ className: 'class1' });
            const sink = toggleClass(<HTMLElement>el, 'class1');
            expect(el.className).toContain('class1');

            sink(false);
            expect(el.className).not.toContain('class1');
        });

    });

});
