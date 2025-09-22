// import { describe } from 'node:test'
import { MockElement } from '../test-support';
import { eventListnerSource } from './event-listener';

describe('eventListner Source', () => {

    describe('Given a node and an event name', () => {

        it('registers an event listener', () => {
            const el = MockElement();
            let pass = false;
            const spy = () => {
                pass = true;
            }

            const source = eventListnerSource(<HTMLElement>el, 'click', spy);
            el.dispatchEvent(new Event('click'));

            expect(pass).toEqual(true);
        });

    });

});
