import { MockElement } from '../test-support';
import { DatasetSink, DatasetObjectSink } from './dataset-sink';

describe('dataset Sink', () => {

    describe('Given a key', () => {

        it('sets data on sink', () => {
            const el = MockElement();
            const sink = DatasetSink(<HTMLElement>el, 'key1');

            sink('value1');
            expect(el.dataset.key1).toEqual('value1');
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

    });

});
