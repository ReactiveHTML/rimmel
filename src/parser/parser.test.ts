import rml from './parser';
import { waitingElementHanlders } from '../internal-state';
import { RMLEventName } from '../types/dom';

describe('Parser', () => {
    beforeEach(() => {
        globalThis.document = globalThis.document || {};
        globalThis.document.addEventListener = (eventName: RMLEventName, handler: EventListenerOrEventListenerObject) => {};
        waitingElementHanlders.clear();
    });

    describe('Sources', () => {
        describe('Event Handlers', () => {
            const handlerFn = () => {};
            const template = rml`<div onclick="${handlerFn}">Hello</div>`;

            expect(template).toEqual('<div RESOLVE="#REF0" onclick="">Hello</div>');
                expect(waitingElementHanlders.get('#REF0')).toEqual([{ handler: handlerFn }]);

        });

    });

    describe('Sinks', () => {
    });

    describe('Plain Objects', () => {
    });
});
