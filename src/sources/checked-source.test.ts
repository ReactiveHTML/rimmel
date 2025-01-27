import type { Observable } from 'rxjs';

import { Subject } from 'rxjs';
import { MockElement, MockEvent } from '../test-support';
import { CheckedState, checkedState } from './checked-source';

describe('CheckedState Event Adapter', () => {

    it('Emits the checked state of an element into a target', () => {
        const value = true;

        const el = MockElement({
            tagName: 'INPUT',
            type: 'checkbox',
            checked: value,
        });

        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const handlerSpy = jest.fn();
        const source = CheckedState(handlerSpy);
        source.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(value);
    });

});


describe('checkedState Event Operator', () => {

    it('Emits the checked state of an element into a target', () => {
        const value = true;
        const el = MockElement({
            tagName: 'INPUT',
            type: 'checkbox',
            checked: value,
        });

        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const handlerSpy = jest.fn();
        const pipeline = new Subject<typeof eventData>().pipe(checkedState) as Observable<boolean> & Subject<typeof eventData>;
        pipeline.subscribe(x=>handlerSpy(x));
        pipeline.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(value);
    });

});
