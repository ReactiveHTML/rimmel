import { MockElement } from '../test-support';
import { DatasetSink, DatasetObjectSink } from './dataset-sink';

describe('Dataset Sink', () => {

	describe('Given a key', () => {

		it('sets data on sink', () => {
			const el = MockElement();
			const sink = DatasetSink(<HTMLElement>el, 'key1');

			sink('value1');
			expect(el.dataset.key1).toEqual('value1');
		});

		describe('When a key is in kebab case', () => {
			it('sets a dataset attribute using camelCase on sink', () => {
				const el = MockElement();
				const sink = DatasetSink(<HTMLElement>el, 'another-key');

				const fluff = 'whatever';
				sink(fluff);

				expect(el.dataset.anotherKey).toEqual(fluff);
			});

		});

	});

});

describe('Dataset Object Sink', () => {

	describe('Given a dataset object', () => {

		it('sets data on sink', () => {
			const el = MockElement();
			const sink = DatasetObjectSink(<HTMLElement>el);

			sink({
				key1: 'value1',
				key2: 'value2',
			});
			expect(el.dataset.key1).toEqual('value1');
			expect(el.dataset.key2).toEqual('value2');
		});

		it('clears undefined data on sink', () => {
			const el = MockElement({
				dataset: {
					key1: 'value1',
					key2: 'value2',
				}
			});
			const sink = DatasetObjectSink(<HTMLElement>el);

			sink({
				key2: undefined,
			});
			expect(el.dataset.key1).toEqual('value1');
			expect(el.dataset.key2).toBeUndefined();
		});

		describe('When a key is in kebab case', () => {
			it('sets a dataset attribute using camelCase on sink', () => {
				const el = MockElement();
				const sink = DatasetObjectSink(<HTMLElement>el);

				const fluff = 'whatever';
				sink({
					'first': fluff,
					'second-key': fluff,
					'one-More-key': fluff,
					'yet-1-more-key': fluff,
					'just-a-ᶲoreign-key': fluff,
				});
				expect(el.dataset.first).toEqual(fluff);
				expect(el.dataset.secondKey).toEqual(fluff);
				expect(el.dataset.oneMoreKey).toEqual(fluff);
				expect(el.dataset.yet1MoreKey).toEqual(fluff);
				expect(el.dataset.justAᶲoreignKey).toEqual(fluff);
			});

		});

	});

});
