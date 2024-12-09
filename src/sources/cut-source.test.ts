import { Observable, Subject } from 'rxjs';
import { MockElement, MockEvent } from '../test-support';
import { Cut, cut } from './cut-source';

describe('Cut Event Adapter', () => {

    it('Cuts a value from an element into a target', () => {
        const oldValue = 'old data';

        const el = MockElement({
            tagName: 'INPUT',
            type: 'text',
            value: oldValue,
        });
        
        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const handlerSpy = jest.fn();
        const source = Cut(handlerSpy);
        source.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(oldValue);
        expect(el.value).toEqual('');
    });

});

describe('cut Event Operator', () => {

    it('Cuts and emits a value from an element', () => {
        const oldValue = 'old data';

        const el = MockElement({
            tagName: 'INPUT',
            type: 'text',
            value: oldValue,
        });
        
        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const handlerSpy = jest.fn();
        const pipeline = new Subject<typeof eventData>().pipe(cut) as Observable<string> & Subject<typeof eventData>;
        pipeline.subscribe(x=>handlerSpy(x));
        pipeline.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(oldValue);
        expect(el.value).toEqual('');
    });

});
