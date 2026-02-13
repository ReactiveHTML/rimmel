import type { Observable } from 'rxjs';

import { Subject } from 'rxjs';
import { MockElement, MockEvent } from '../test-support';
import { Dataset, dataset, DatasetObject, datasetObject } from './dataset-source';
import { Observer } from '../types/futures';

describe('DatasetObject Event Adapter', () => {

	it('Emits an element`s dataset object into the given target', () => {
		const value = {
			foo: 'bar',
			baz: 'bat',
		};
		const el = MockElement({
			tagName: 'DIV',
			dataset: value as DOMStringMap,
		});

		const eventData = MockEvent<MouseEvent>('mousemove', {
			target: el,
		});

		const handlerSpy = jest.fn();
		const source = DatasetObject(handlerSpy) as Observer<typeof eventData>;
		source.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(value);
	});

});

describe('datasetObject Event Adapter Operator', () => {

	it('Emits an element`s dataset object into a target', () => {
		const value = {
			foo: 'bar',
			baz: 'bat',
		};
		const el = MockElement({
			tagName: 'DIV',
			dataset: value as DOMStringMap,
		});

		const eventData = MockEvent<MouseEvent>('mousemove', {
			target: el,
		});

		const handlerSpy = jest.fn();
		const pipeline = new Subject<typeof eventData>().pipe(datasetObject) as Observable<typeof value> & Observer<typeof eventData>;
		pipeline.subscribe(x=>handlerSpy(x));
		pipeline.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(value);
	});

});

describe('Dataset Event Adapter', () => {

	it('Emits the specified element`s dataset attribute into the given target', () => {
		const value = {
			foo: 'bar',
			baz: 'bat',
		};
		const key = 'foo';
		const el = MockElement({
			tagName: 'DIV',
			dataset: value as DOMStringMap,
		});

		const eventData = MockEvent<MouseEvent>('mousemove', {
			target: el,
		});

		const handlerSpy = jest.fn();
		const source = Dataset(key, handlerSpy) as Observer<typeof eventData>;
		source.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(value[key]);
	});

});

describe('dataset Event Adapter Operator', () => {

	it('Emits the specified element`s dataset attribute into a target', () => {
		const value = {
			foo: 'bar',
			baz: 'bat',
		};
		const key = 'foo';
		const el = MockElement({
			tagName: 'DIV',
			dataset: value as DOMStringMap,
		});

		const eventData = MockEvent<MouseEvent>('mousemove', {
			target: el,
		});

		const handlerSpy = jest.fn();
		const pipeline = new Subject<typeof eventData>().pipe(dataset('foo')) as Observable<string> & Observer<typeof eventData>;
		pipeline.subscribe((x: any)=>handlerSpy(x));
		pipeline.next(eventData);

		expect(handlerSpy).toHaveBeenCalledWith(value[key]);
	});

});

