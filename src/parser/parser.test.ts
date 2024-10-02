import { waitingElementHanlders } from '../internal-state';
import { RMLEventName } from '../types/dom';
import rml from './parser';


describe('Parser', () => {
    // FIXME: move to a beforeEeach() call. Doesn't seem to work in Bun.
    global.document = globalThis.document || {};
    global.document = globalThis.document;
    global.document.addEventListener = (eventName: RMLEventName, handler: EventListenerOrEventListenerObject) => {};
    waitingElementHanlders.clear();

    describe('Sources', () => {
        describe('Event Handlers', () => {
            const handlerFn = () => {};
            const template = rml`<div onclick="${handlerFn}">Hello</div>`;

            expect(template).toEqual('<div onclick="#REF0" RESOLVE="#REF0">Hello</div>');
            expect(waitingElementHanlders.get('#REF0')).toEqual([{
                 eventName: 'click',
                 listener: handlerFn,
                 type: 'source',
            }]);

        });

    });

    describe('Sinks', () => {
    });

    describe('Plain Objects', () => {
    });
});
