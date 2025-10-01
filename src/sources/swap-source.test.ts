import type { Observable } from 'rxjs';

import { Subject } from 'rxjs';
import { MockElement, MockEvent } from '../test-support';
import { Swap, swap } from './swap-source';

describe('Swap Event Adapter', () => {

    it('Swaps a value in an element with a static string', () => {
        const oldValue = 'old data';
        const newValue = 'new data';

        const el = MockElement({
            tagName: 'INPUT',
            type: 'text',
            value: oldValue,
        });

        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const handlerSpy = jest.fn();
        const source = Swap(newValue)(handlerSpy);
        source.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(oldValue);
        expect(el.value).toEqual(newValue);
    });

    it('Swaps a value in an element using a function', () => {
        const oldValue = 'old data';

        const el = MockElement({
            tagName: 'INPUT',
            type: 'text',
            value: oldValue,
        });

        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const replaceFn = (v: string) => v.toUpperCase();

        const handlerSpy = jest.fn();
        const source = Swap(replaceFn)(handlerSpy);
        source.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(oldValue);
        expect(el.value).toEqual('OLD DATA');
    });

    it('Swaps a value in an element with empty string by default', () => {
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
        const source = Swap()(handlerSpy);
        source.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(oldValue);
        expect(el.value).toEqual('');
    });

});

describe('swap Event Operator', () => {

    it('Swaps and emits a value from an element with static string', () => {
        const oldValue = 'old data';
        const newValue = 'new data';

        const el = MockElement({
            tagName: 'INPUT',
            type: 'text',
            value: oldValue,
        });

        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const handlerSpy = jest.fn();
        const pipeline = new Subject<typeof eventData>().pipe(swap(newValue)) as Observable<string> & Subject<typeof eventData>;
        pipeline.subscribe(x => handlerSpy(x));
        pipeline.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(oldValue);
        expect(el.value).toEqual(newValue);
    });

    it('Swaps and emits a value from an element using function', () => {
        const oldValue = 'old data';

        const el = MockElement({
            tagName: 'INPUT',
            type: 'text',
            value: oldValue,
        });

        const eventData = MockEvent('input', {
            target: el as HTMLInputElement
        });

        const replaceFn = (v: string) => v.toUpperCase();

        const handlerSpy = jest.fn();
        const pipeline = new Subject<typeof eventData>().pipe(swap(replaceFn)) as Observable<string> & Subject<typeof eventData>;
        pipeline.subscribe(x => handlerSpy(x));
        pipeline.next(eventData);

        expect(handlerSpy).toHaveBeenCalledWith(oldValue);
        expect(el.value).toEqual('OLD DATA');
    });

});