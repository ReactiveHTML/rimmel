import type { Observable } from 'rxjs';
import type { Coords } from '../types/coords';

import { Subject } from 'rxjs';
import { MockElement, MockEvent } from '../test-support';
import { ClientXY, clientXY } from './client-xy-source';
import { Observer } from '../types';

describe('ClientXY Event Adapter', () => {

	it('Emits an [event.clientX, event.clientY] tuple into a target', () => {
		const value = [100, 200] as Coords;
		const el = MockElement({
			tagName: 'DIV',
		});

		const eventData = MockEvent<PointerEvent>('mousemove', {
			target: el,
			clientX: value[0],
			clientY: value[1],
		});

		const handlerSpy = jest.fn();
		const source = ClientXY(handlerSpy);
		source.next(eventData as PointerEvent);

		expect(handlerSpy).toHaveBeenCalledWith(value);
	});

});


describe('clientXY Event Operator', () => {

	it('Emits the checked state of an element into a target', () => {
		const value = [100, 200] as Coords;
		const el = MockElement({
			tagName: 'DIV',
		});

		const eventData = MockEvent<PointerEvent>('mousemove', {
			target: el as typeof el,
			clientX: value[0],
			clientY: value[1],
		});

		const handlerSpy = jest.fn();
		const pipeline = new Subject<typeof eventData>().pipe(clientXY) as Observable<Coords> & Observer<typeof eventData>;
		pipeline.subscribe(x=>handlerSpy(x));
		pipeline.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(value);
	});

});
